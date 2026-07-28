// AKAL Creator sells to US/UK B2B software companies. There is no French
// surface, and a half-translated one is worse than none.
//
// The /fr routes and the language toggle still exist in the router; they are
// aliased to English here so nothing 404s or renders raw translation keys while
// those routes are being removed. Delete this file once the router is cleaned up.
export { en as fr } from './en';
