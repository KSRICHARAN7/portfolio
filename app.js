'use strict';
document.querySelectorAll('.evidence-details').forEach(details=>details.addEventListener('toggle',()=>{details.querySelector('summary span').textContent=details.open?'−':'+';}));
