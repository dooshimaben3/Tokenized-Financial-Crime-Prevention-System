# Tokenized Financial Crime Prevention System

A blockchain-based system for financial crime prevention using Clarity smart contracts on the Stacks blockchain.

## Overview

This system provides a comprehensive set of smart contracts for financial institutions to prevent and detect financial crimes in a tokenized environment. The system includes:

1. **Institution Verification Contract**: Validates and verifies financial entities within the system
2. **Transaction Monitoring Contract**: Analyzes payment patterns for suspicious activity
3. **Risk Scoring Contract**: Identifies suspicious activity based on risk factors
4. **Alert Management Contract**: Handles notification of potential issues
5. **Investigation Tracking Contract**: Records review and resolution of suspicious activities

## Contracts

### Institution Verification Contract

This contract manages the verification of financial institutions within the system:

- Stores verified institutions with their verification level and status
- Allows admin to verify new institutions
- Allows admin to update institution status
- Provides read-only functions to check verification status

### Transaction Monitoring Contract

This contract records and monitors transactions:

- Records transactions with sender, recipient, amount, and type
- Allows admin to flag transactions with risk indicators
- Provides read-only functions to check transaction details and flags

### Risk Scoring Contract

This contract manages risk scores for entities:

- Sets base risk scores for entities
- Updates activity-based risk scores
- Calculates total risk scores
- Categorizes entities as low, medium, or high risk

### Alert Management Contract

This contract manages alerts for suspicious activities:

- Creates alerts with entity, type, severity, and description
- Allows admin to resolve alerts with resolution notes
- Provides read-only functions to check alert details

### Investigation Tracking Contract

This contract tracks investigations of suspicious activities:

- Opens investigations with subject, investigator, and related alerts
- Updates investigation status and findings
- Adds related alerts to investigations
- Provides read-only functions to check investigation details

## Error Codes

Each contract uses specific error codes:

- `u100`: Unauthorized (not admin)
- `u101-u103`: Institution verification errors
- `u201-u203`: Transaction monitoring errors
- `u301-u302`: Risk scoring errors
- `u401`: Alert management errors
- `u501-u502`: Investigation tracking errors

## Testing

Tests are written using Vitest and simulate the Clarity environment to test contract functions.

## Usage

To use these contracts:

1. Deploy the contracts to the Stacks blockchain
2. Set up admin accounts for each contract
3. Verify institutions using the Institution Verification Contract
4. Monitor transactions using the Transaction Monitoring Contract
5. Score entity risk using the Risk Scoring Contract
6. Create alerts for suspicious activities using the Alert Management Contract
7. Track investigations using the Investigation Tracking Contract

## Security Considerations

- Admin access is restricted to authorized principals
- Data validation is performed for all inputs
- Error handling is implemented for all functions
- Limits are set for list sizes to prevent DoS attacks
