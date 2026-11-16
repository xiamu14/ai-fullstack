import { healthContract } from './health/health.contract.js';
import { identityContract } from './identity/identity.contract.js';

export const apiContract = {
  system: healthContract,
  account: identityContract,
};
