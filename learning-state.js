/** Optional, account-scoped practice records; these never award vocabulary XP. */
export function freshLearning(){return {batchSize:5,draft:null,activities:[]};}
export function validateLearning(value){
 if(value===undefined)return undefined;
 if(!value||![3,5,10].includes(value.batchSize)||!Array.isArray(value.activities)||value.activities.length>20)throw new TypeError('Invalid learning preferences');
 const activities=value.activities.map(r=>{
  if(!r||typeof r.id!=='string'||r.id.length>100||!['reading-comprehension','reading-check','reading-word','transfer','placement','level-practice'].includes(r.kind)||!Number.isInteger(r.stageId)||r.stageId<1||r.stageId>100||typeof r.response!=='string'||r.response.length>1200||typeof r.evidence!=='string'||r.evidence.length>1200||!['needs-review','evidence-missing','correct','incorrect','suggestion'].includes(r.result)||typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at)))throw new TypeError('Invalid learning activity');
  return {id:r.id,kind:r.kind,stageId:r.stageId,response:r.response,evidence:r.evidence,result:r.result,at:r.at};
 });
 const draft=value.draft??null;
 if(draft!==null&&(typeof draft!=='object'||Array.isArray(draft)||JSON.stringify(draft).length>65000))throw new TypeError('Invalid practice draft');
 return {batchSize:value.batchSize,draft:draft===null?null:structuredClone(draft),activities};
}
export function addActivity(learning,record){return validateLearning({...learning,activities:[...learning.activities,record].slice(-20)});}
