import { validateLearning } from './learning-state.js';
/** Shared browser/server contract. An adventure is always a complete v1 object, never null. */
export const adventureRoles = ['cartographer', 'scholar', 'scout'];
export function freshAdventure() {
 return {version:1,seed:Math.floor(Math.random()*0xffffffff),role:null,choices:{}};
}
export function validateAdventure(value) {
 if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==1||!Number.isInteger(value.seed)||value.seed<0||value.seed>0xffffffff||!(value.role===null||adventureRoles.includes(value.role))||!value.choices||typeof value.choices!=='object'||Array.isArray(value.choices))throw new TypeError('Invalid adventure snapshot');
 const choices={};
 if(Object.keys(value.choices).length>900)throw new TypeError('Too many adventure choices');
 for(const [key,choice] of Object.entries(value.choices)){
  if(!/^(?:[1-9]|[1-9]\d|100):[1-9]$/.test(key)||!choice||typeof choice!=='object'||!['curiosity','courage','kindness'].includes(choice.action)||!adventureRoles.includes(choice.role))throw new TypeError('Invalid adventure choice');
  choices[key]={action:choice.action,role:choice.role};
 }
 return {version:1,seed:value.seed,role:value.role,choices,...(value.learning===undefined?{}:{learning:validateLearning(value.learning)})};
}
