import { storage } from "../storage";
import { notificationService } from "./notificationService";
import { type InsertTenderMatch } from "@shared/schema";

class MatchingService {
  async findMatches(userId: string): Promise<void> {
    try {
      const businessProfile = await storage.getBusinessProfile(userId);
      if (!businessProfile) {
        console.log(`No business profile found for user ${userId}`);
        return;
      }

      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`User ${userId} not found`);
        return;
      }

      // Get active tenders
      const tenders = await storage.getTenders({ status: 'active', limit: 1000 });
      
      for (const tender of tenders) {
        const matchScore = this.calculateMatchScore(businessProfile, tender);
        
        if (matchScore >= 50) { // Only create matches for scores 50% and above
          const matchReasons = this.generateMatchReasons(businessProfile, tender, matchScore);
          
          const match: InsertTenderMatch = {
            userId,
            tenderId: tender.id,
            matchScore,
            matchReasons,
            isViewed: false,
          };

          await storage.createTenderMatch(match);

          // Send notification for high-priority matches
          if (matchScore >= 80 && businessProfile.emailNotifications && user.email) {
            await notificationService.sendTenderMatchNotification(
              userId,
              user.email,
              businessProfile.phoneNumber,
              tender.title,
              matchScore,
              businessProfile.emailNotifications,
              businessProfile.smsNotifications
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error finding matches for user ${userId}:`, error);
    }
  }

  private calculateMatchScore(profile: any, tender: any): number {
    let score = 0;
    let totalWeight = 0;

    // Industry category match (weight: 30)
    if (profile.industryCategories && tender.category) {
      const categoryMatch = profile.industryCategories.some((cat: string) =>
        tender.category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(tender.category.toLowerCase())
      );
      if (categoryMatch) {
        score += 30;
      }
      totalWeight += 30;
    }

    // Province match (weight: 20)
    if (profile.provinces && tender.province) {
      const provinceMatch = profile.provinces.includes(tender.province) ||
        profile.provinces.includes('National') ||
        tender.province === 'National';
      if (provinceMatch) {
        score += 20;
      }
      totalWeight += 20;
    }

    // Value range match (weight: 25)
    if (profile.preferredValueMin && profile.preferredValueMax && tender.valueMin && tender.valueMax) {
      const profileMin = parseFloat(profile.preferredValueMin);
      const profileMax = parseFloat(profile.preferredValueMax);
      const tenderMin = parseFloat(tender.valueMin);
      const tenderMax = parseFloat(tender.valueMax);

      // Check if there's any overlap in value ranges
      const hasOverlap = profileMin <= tenderMax && profileMax >= tenderMin;
      if (hasOverlap) {
        // Calculate overlap percentage
        const overlapMin = Math.max(profileMin, tenderMin);
        const overlapMax = Math.min(profileMax, tenderMax);
        const overlapSize = overlapMax - overlapMin;
        const tenderRangeSize = tenderMax - tenderMin;
        const overlapPercentage = (overlapSize / tenderRangeSize) * 100;
        
        score += Math.min(25, (overlapPercentage / 100) * 25);
      }
      totalWeight += 25;
    }

    // CIDB grading match (weight: 15)
    if (profile.cidbGrading && tender.cidbRequired) {
      const profileGrade = this.extractGradeNumber(profile.cidbGrading);
      const requiredGrade = this.extractGradeNumber(tender.cidbRequired);
      
      if (profileGrade && requiredGrade && profileGrade >= requiredGrade) {
        score += 15;
      }
      totalWeight += 15;
    }

    // B-BBEE level match (weight: 10)
    if (profile.bbbeeLevel && tender.bbbeeRequired) {
      const profileLevel = this.extractBBBEELevel(profile.bbbeeLevel);
      const requiredLevel = this.extractBBBEELevel(tender.bbbeeRequired);
      
      if (profileLevel && requiredLevel && profileLevel <= requiredLevel) {
        score += 10;
      }
      totalWeight += 10;
    }

    // Return percentage score
    return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  }

  private generateMatchReasons(profile: any, tender: any, score: number): string[] {
    const reasons: string[] = [];

    if (profile.industryCategories && tender.category) {
      const categoryMatch = profile.industryCategories.some((cat: string) =>
        tender.category.toLowerCase().includes(cat.toLowerCase())
      );
      if (categoryMatch) {
        reasons.push(`Industry match: ${tender.category}`);
      }
    }

    if (profile.provinces && tender.province) {
      const provinceMatch = profile.provinces.includes(tender.province);
      if (provinceMatch) {
        reasons.push(`Location match: ${tender.province}`);
      }
    }

    if (profile.preferredValueMin && profile.preferredValueMax && tender.valueMin && tender.valueMax) {
      const profileMin = parseFloat(profile.preferredValueMin);
      const profileMax = parseFloat(profile.preferredValueMax);
      const tenderMin = parseFloat(tender.valueMin);
      const tenderMax = parseFloat(tender.valueMax);

      const hasOverlap = profileMin <= tenderMax && profileMax >= tenderMin;
      if (hasOverlap) {
        reasons.push('Value range within your preferences');
      }
    }

    if (profile.cidbGrading && tender.cidbRequired) {
      const profileGrade = this.extractGradeNumber(profile.cidbGrading);
      const requiredGrade = this.extractGradeNumber(tender.cidbRequired);
      
      if (profileGrade && requiredGrade && profileGrade >= requiredGrade) {
        reasons.push(`CIDB qualification meets requirement (${tender.cidbRequired})`);
      }
    }

    if (profile.bbbeeLevel && tender.bbbeeRequired) {
      const profileLevel = this.extractBBBEELevel(profile.bbbeeLevel);
      const requiredLevel = this.extractBBBEELevel(tender.bbbeeRequired);
      
      if (profileLevel && requiredLevel && profileLevel <= requiredLevel) {
        reasons.push(`B-BBEE level meets requirement (${tender.bbbeeRequired})`);
      }
    }

    if (score >= 90) {
      reasons.unshift('Excellent match for your business');
    } else if (score >= 70) {
      reasons.unshift('Good match for your business');
    } else if (score >= 50) {
      reasons.unshift('Potential match for your business');
    }

    return reasons;
  }

  private extractGradeNumber(gradeString: string): number | null {
    const match = gradeString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  private extractBBBEELevel(levelString: string): number | null {
    const match = levelString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  async runMatchingForAllUsers(): Promise<void> {
    try {
      console.log("Starting matching process for all users...");
      
      // This would need to be implemented with pagination for large user bases
      // For now, we'll run it for users who have business profiles
      const users = await storage.getTenders({ limit: 1000 }); // This is a placeholder
      
      // In a real implementation, you'd fetch all users with business profiles
      // and run matching for each one
      console.log("Matching process completed");
    } catch (error) {
      console.error("Error running matching for all users:", error);
    }
  }
}

export const matchingService = new MatchingService();
