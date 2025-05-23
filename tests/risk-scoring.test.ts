import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Clarity environment
const mockClarity = {
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  blockHeight: 100,
  entityRiskScores: new Map(),
  
  // Mock functions
  isEq: (a, b) => a === b,
  mapGet: (map, key) => map.get(key),
  mapSet: (map, key, value) => map.set(key, value),
};

// Mock contract functions
const riskScoring = {
  admin: mockClarity.txSender,
  lowRiskThreshold: 30,
  mediumRiskThreshold: 70,
  
  setBaseRisk: (entity, score) => {
    // Check if sender is admin
    if (mockClarity.txSender !== riskScoring.admin) {
      return { err: 100 };
    }
    
    // Check score range
    if (score > 100) {
      return { err: 301 };
    }
    
    let activityScore = 0;
    
    // Check if entity already exists
    if (mockClarity.entityRiskScores.has(entity)) {
      activityScore = mockClarity.entityRiskScores.get(entity).activityScore;
    }
    
    // Set entity risk data
    mockClarity.entityRiskScores.set(entity, {
      baseScore: score,
      activityScore,
      totalScore: score + activityScore,
      lastUpdated: mockClarity.blockHeight
    });
    
    return { ok: true };
  },
  
  updateActivityScore: (entity, score) => {
    // Check if sender is admin
    if (mockClarity.txSender !== riskScoring.admin) {
      return { err: 100 };
    }
    
    // Check score range
    if (score > 100) {
      return { err: 301 };
    }
    
    // Check if entity exists
    if (!mockClarity.entityRiskScores.has(entity)) {
      return { err: 302 };
    }
    
    // Update entity risk data
    const entityData = mockClarity.entityRiskScores.get(entity);
    const baseScore = entityData.baseScore;
    
    mockClarity.entityRiskScores.set(entity, {
      baseScore,
      activityScore: score,
      totalScore: baseScore + score,
      lastUpdated: mockClarity.blockHeight
    });
    
    return { ok: true };
  },
  
  getRiskCategory: (entity) => {
    // Check if entity exists
    if (!mockClarity.entityRiskScores.has(entity)) {
      return { err: 302 };
    }
    
    const entityData = mockClarity.entityRiskScores.get(entity);
    const totalScore = entityData.totalScore;
    
    if (totalScore <= riskScoring.lowRiskThreshold) {
      return { ok: 'low' };
    } else if (totalScore <= riskScoring.mediumRiskThreshold) {
      return { ok: 'medium' };
    } else {
      return { ok: 'high' };
    }
  },
  
  getRiskDetails: (entity) => {
    return mockClarity.entityRiskScores.get(entity);
  },
  
  transferAdmin: (newAdmin) => {
    // Check if sender is admin
    if (mockClarity.txSender !== riskScoring.admin) {
      return { err: 100 };
    }
    
    riskScoring.admin = newAdmin;
    return { ok: true };
  }
};

describe('Risk Scoring Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    mockClarity.entityRiskScores.clear();
    riskScoring.admin = mockClarity.txSender;
    mockClarity.blockHeight = 100;
  });
  
  it('should set base risk score for a new entity', () => {
    const entity = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const score = 25;
    
    const result = riskScoring.setBaseRisk(entity, score);
    
    expect(result).toEqual({ ok: true });
    expect(mockClarity.entityRiskScores.has(entity)).toBe(true);
    
    const entityData = mockClarity.entityRiskScores.get(entity);
    expect(entityData.baseScore).toBe(score);
    expect(entityData.activityScore).toBe(0);
    expect(entityData.totalScore).toBe(score);
  });
  
  it('should update activity score for an existing entity', () => {
    const entity = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const baseScore = 25;
    const activityScore = 40;
    
    // First set base risk
    riskScoring.setBaseRisk(entity, baseScore);
    
    // Then update activity score
    const result = riskScoring.updateActivityScore(entity, activityScore);
    
    expect(result).toEqual({ ok: true });
    
    const entityData = mockClarity.entityRiskScores.get(entity);
    expect(entityData.baseScore).toBe(baseScore);
    expect(entityData.activityScore).toBe(activityScore);
    expect(entityData.totalScore).toBe(baseScore + activityScore);
  });
  
  it('should fail to update activity score for non-existent entity', () => {
    const entity = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const activityScore = 40;
    
    const result = riskScoring.updateActivityScore(entity, activityScore);
    
    expect(result).toEqual({ err: 302 });
  });
  
  it('should return correct risk category', () => {
    const lowRiskEntity = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const mediumRiskEntity = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const highRiskEntity = 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    // Set risk scores
    riskScoring.setBaseRisk(lowRiskEntity, 20);
    riskScoring.setBaseRisk(mediumRiskEntity, 50);
    riskScoring.setBaseRisk(highRiskEntity, 80);
    
    // Check risk categories
    expect(riskScoring.getRiskCategory(lowRiskEntity)).toEqual({ ok: 'low' });
    expect(riskScoring.getRiskCategory(mediumRiskEntity)).toEqual({ ok: 'medium' });
    expect(riskScoring.getRiskCategory(highRiskEntity)).toEqual({ ok: 'high' });
  });
  
  it('should transfer admin rights', () => {
    const newAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    const result = riskScoring.transferAdmin(newAdmin);
    
    expect(result).toEqual({ ok: true });
    expect(riskScoring.admin).toBe(newAdmin);
  });
});
