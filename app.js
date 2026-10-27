(() => {
  'use strict';
  const KEY = 'restopilot_pro_v1_data';
  const $ = id => document.getElementById(id);
  const dateISO = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today = () => dateISO();
  const uuid = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  const money = value => `${Math.round(Number(value) || 0).toLocaleString('fr-FR')} F`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const starter = () => ({
    version: 1,
    settings: { name: 'Mon Restaurant', owner: '', phone: '', currency: 'FCFA' },
    products: [
      {id:uuid(),name:'Riz sauce',category:'Plats principaux',price:1000,batchCost:3500,yield:10,marginTarget:30,ingredients:'Riz, sauce, huile, condiments',active:true},
      {id:uuid(),name:'Riz gras',category:'Plats principaux',price:1200,batchCost:5000,yield:10,marginTarget:30,ingredients:'Riz, viande, huile, légumes, condiments',active:true},
      {id:uuid(),name:'Haricots',category:'Plats principaux',price:500,batchCost:2500,yield:10,marginTarget:30,ingredients:'Haricots, huile, condiments',active:true},
      {id:uuid(),name:'Djonon',category:'Plats principaux',price:1000,batchCost:4000,yield:10,marginTarget:30,ingredients:'Riz, ingrédients de la recette',active:true},
      {id:uuid(),name:'Gaonré',category:'Plats principaux',price:1000,batchCost:4000,yield:10,marginTarget:30,ingredients:'Ingrédients à préciser',active:true},
      {id:uuid(),name:'Soupe de poulet',category:'Soupes',price:1500,batchCost:8000,yield:8,marginTarget:30,ingredients:'Poulet, légumes, condiments',active:true},
      {id:uuid(),name:'Soupe de jarret',category:'Soupes',price:1500,batchCost:8500,yield:8,marginTarget:30,ingredients:'Jarret, légumes, condiments',active:true},
      {id:uuid(),name:'Soupe de boyeau',category:'Soupes',price:1000,batchCost:5000,yield:8,marginTarget:30,ingredients:'Boyeau, légumes, condiments',active:true},
      {id:uuid(),name:'Petit-déjeuner',category:'Petit-déjeuner',price:500,batchCost:2500,yield:10,marginTarget:30,ingredients:'À préciser selon le menu',active:true},
      {id:uuid(),name:'Purée de mil',category:'Petit-déjeuner',price:300,batchCost:1200,yield:10,marginTarget:30,ingredients:'Mil, eau, sucre ou accompagnement',active:true}
    ], sales: [], expenses: []
  });
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { data = null; }
  if (!data || !Array.isArray(data.products) || !Array.isArray(data.sales) || !Array.isArray(data.expenses)) data = starter();
  if (!data.settings) data.settings = {name:'Mon Restaurant',owner:'',phone:'',currency:'FCFA'};
  let toastTimer;
  function save() { localStorage.setItem(KEY, JSON.stringify(data)); renderAll(); }
  function toast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
  function unitCost(product) { return Math.max(0, Number(product.batchCost)||0) / Math.max(1, Number(product.yield)||1); }
  function saleTotal(sale) { return Math.max(0, Number(sale.qty)||0) * Math.max(0, Number(sale.price)||0); }
  function activeSales(list=data.sales) { return list.filter(s=>!s.cancelled); }
  function dateInRange(date, start, end) { return (!start || date >= start) && (!end || date <= end); }
  function totals(start='', end='') {
    const sales = activeSales().filter(s=>dateInRange(s.date,start,end));
    const expenses = data.expenses.filter(e=>dateInRange(e.date,start,end));
    const revenue = sales.reduce((sum,s)=>sum+saleTotal(s),0);
    const cost = sales.reduce((sum,s)=>sum+(Number(s.costUnit)||0)*(Number(s.qty)||0),0);
    const expenseTotal = expenses.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
    return {sales,expenses,revenue,cost,expenseTotal,gross:revenue-cost,profit:revenue-cost-expenseTotal};
  }
  function table(headers, rows, empty='Aucune donnée pour le moment.') {
    if (!rows.length) return `<div class="empty">${esc(empty)}</div>`;
    return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }
  function renderDashboard() {
    const t=totals(); $('kpiRevenue').textContent=money(t.revenue); $('kpiCost').textContent=money(t.cost); $('kpiExpenses').textContent=money(t.expenseTotal); $('kpiProfit').textContent=money(t.profit); $('kpiProfit').className=t.profit<0?'negative':''; $('kpiSalesCount').textContent=`${t.sales.length} vente${t.sales.length>1?'s':''}`;
    const recent=[...data.sales].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,6);
    $('recentSales').innerHTML=table(['Date','Plat','Qté','Total'],recent.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.productName)}${s.cancelled?' <span class="pill">Annulée</span>':''}</td><td>${s.qty}</td><td class="num">${money(saleTotal(s))}</td></tr>`),'Aucune vente enregistrée.');
    const best = Object.entries(t.sales.reduce((acc,s)=>{acc[s.productName]=(acc[s.productName]||0)+Number(s.qty||0);return acc;},{})).sort((a,b)=>b[1]-a[1])[0];
    $('quickSummary').innerHTML=[['Marge brute estimée',money(t.gross)],['Nombre de plats actifs',data.products.filter(p=>p.active!==false).length],['Plats vendus',t.sales.reduce((n,s)=>n+Number(s.qty||0),0)],['Plat le plus vendu',best?`${best[0]} (${best[1]})`:'Pas encore de vente'],['Dépenses enregistrées',data.expenses.length]].map(([a,b])=>`<div class="summary-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');
  }
  function renderProducts() {
    $('productsTable').innerHTML=table(['Plat','Catégorie','Prix vente','Coût / portion','Marge / portion','Marge %','Actions'],data.products.map(p=>{
      const c=unitCost(p), margin=Number(p.price||0)-c, percent=Number(p.price)>0?margin/Number(p.price)*100:0;
      return `<tr><td><strong>${esc(p.name)}</strong>${p.active===false?' <span class="pill">Inactif</span>':''}</td><td>${esc(p.category||'—')}</td><td>${money(p.price)}</td><td>${money(c)}</td><td class="${margin<0?'negative':'positive'}">${money(margin)}</td><td>${percent.toFixed(1).replace('.',',')}%</td><td><button class="text-btn" data-edit-product="${p.id}">Modifier</button> <button class="text-btn" data-toggle-product="${p.id}">${p.active===false?'Activer':'Désactiver'}</button></td></tr>`;
    }));
    const active=data.products.filter(p=>p.active!==false); $('saleProduct').innerHTML=active.length?active.map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join(''):'<option value="">Ajoute un plat dans le menu</option>';
    updateSalePreview();
  }
  function renderSales() {
    const filterDate=$('salesFilterDate').value;
    const list=[...data.sales].filter(s=>!filterDate||s.date===filterDate).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
    $('salesTable').innerHTML=table(['Date','Plat','Qté','Prix unité','Total','Coût estimé','État','Action'],list.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.productName)}</td><td>${s.qty}</td><td>${money(s.price)}</td><td>${money(saleTotal(s))}</td><td>${money((Number(s.costUnit)||0)*Number(s.qty||0))}</td><td>${s.cancelled?'<span class="pill">Annulée</span>':'Validée'}</td><td>${s.cancelled?'—':`<button class="text-btn" data-cancel-sale="${s.id}">Annuler</button>`}</td></tr>`),filterDate?`Aucune vente pour le ${filterDate}.`:'Aucune vente enregistrée.');
    const day=filterDate||today();
    const t=totals(day,day);
    $('dayRevenue').textContent=money(t.revenue); $('dayCost').textContent=money(t.cost); $('dayExpenses').textContent=money(t.expenseTotal); $('dayProfit').textContent=money(t.profit); $('dayProfit').className=t.profit<0?'negative':'';
    $('salesDayLabel').textContent=filterDate?`Affichage filtré : ${filterDate}. Les ventes de cette date restent incluses dans les rapports globaux.`:'Historique complet affiché. Les indicateurs ci-dessus correspondent à aujourd’hui ('+today()+').';
  }
  function renderExpenses() {
    const list=[...data.expenses].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')); const total=list.reduce((n,e)=>n+Number(e.amount||0),0); $('expenseTotal').textContent=money(total);
    $('expensesTable').innerHTML=table(['Date','Catégorie','Description','Montant','Action'],list.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.category)}</td><td>${esc(e.description)}</td><td>${money(e.amount)}</td><td><button class="text-btn" data-delete-expense="${e.id}">Supprimer</button></td></tr>`),'Aucune dépense enregistrée.');
  }
  function renderSettings() { $('businessName').textContent=data.settings.name||'RestoPilot Pro'; $('settingName').value=data.settings.name||''; $('settingOwner').value=data.settings.owner||''; $('settingPhone').value=data.settings.phone||''; $('settingCurrency').value=data.settings.currency||'FCFA'; }
  function renderReports() {
    const start=$('reportStart').value, end=$('reportEnd').value, t=totals(start,end);
    $('reportRevenue').textContent=money(t.revenue); $('reportCost').textContent=money(t.cost); $('reportExpenses').textContent=money(t.expenseTotal); $('reportProfit').textContent=money(t.profit); $('reportProfit').className=t.profit<0?'negative':'';
    const rows=[['Ventes validées',t.sales.length],['Quantité totale vendue',t.sales.reduce((n,s)=>n+Number(s.qty||0),0)],['Marge brute estimée',money(t.gross)],['Dépenses comptabilisées',t.expenses.length],['Résultat estimé',money(t.profit)]];
    $('reportDetails').innerHTML=table(['Indicateur','Valeur'],rows.map(([a,b])=>`<tr><td>${esc(a)}</td><td><strong>${esc(b)}</strong></td></tr>`));
    const dayKeys=new Set([...t.sales.map(s=>s.date),...t.expenses.map(e=>e.date)]);
    const daily=[...dayKeys].sort((a,b)=>b.localeCompare(a)).map(day=>{
      const ds=t.sales.filter(s=>s.date===day), de=t.expenses.filter(e=>e.date===day);
      const rev=ds.reduce((n,s)=>n+saleTotal(s),0), cost=ds.reduce((n,s)=>n+(Number(s.costUnit)||0)*Number(s.qty||0),0), exp=de.reduce((n,e)=>n+Number(e.amount||0),0);
      return `<tr><td>${esc(day)}</td><td>${ds.length}</td><td>${money(rev)}</td><td>${money(cost)}</td><td>${money(exp)}</td><td class="${rev-cost-exp<0?'negative':'positive'}">${money(rev-cost-exp)}</td></tr>`;
    });
    $('dailyReportTable').innerHTML=table(['Date','Ventes','Ventes nettes','Coût estimé','Dépenses','Résultat estimé'],daily,'Aucune vente ou dépense sur cette période.');
  }
  function renderAll() { renderDashboard(); renderProducts(); renderSales(); renderExpenses(); renderSettings(); renderReports(); }
  function showView(view) { document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+view)); document.querySelectorAll('.nav-btn').forEach(el=>el.classList.toggle('active',el.dataset.view===view)); if(view==='reports')renderReports(); $('main').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'smooth'}); }
  function openProductEditor(p=null) {
    $('productEditor').hidden=false; $('productEditorTitle').textContent=p?'Modifier le plat':'Ajouter un plat';
    $('productId').value=p?.id||''; $('productName').value=p?.name||''; $('productCategory').value=p?.category||''; $('productPrice').value=p?.price??0; $('productBatchCost').value=p?.batchCost??0; $('productYield').value=p?.yield??1; $('productMarginTarget').value=p?.marginTarget??30; $('productIngredients').value=p?.ingredients||''; updateRecipeCalculation(); $('productEditor').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function updateRecipeCalculation() {
    const price=Number($('productPrice').value)||0, batch=Number($('productBatchCost').value)||0, yieldCount=Math.max(1,Number($('productYield').value)||1), cost=batch/yieldCount, margin=price-cost, percent=price>0?margin/price*100:0, target=Number($('productMarginTarget').value)||0;
    $('recipeCalculation').innerHTML=`Coût par portion : <strong>${money(cost)}</strong> · Marge brute unitaire : <strong class="${margin<0?'negative':'positive'}">${money(margin)}</strong> · Taux de marge sur prix de vente : <strong>${percent.toFixed(1).replace('.',',')}%</strong> · Objectif : ${target}% ${percent<target?'<span class="negative">— sous l’objectif</span>':'<span class="positive">— objectif atteint</span>'}`;
  }
  function updateSalePreview() {
    const p=data.products.find(x=>x.id===$('saleProduct').value); if(!p){$('saleUnitCost').textContent=money(0);$('salePreview').textContent='Ajoute d’abord un plat au menu.';return;}
    if(document.activeElement!==$('salePrice')) $('salePrice').value=p.price;
    $('saleUnitCost').textContent=money(unitCost(p)); const qty=Math.max(1,Number($('saleQty').value)||1), price=Math.max(0,Number($('salePrice').value)||0); $('salePreview').textContent=`Total : ${money(qty*price)} · Coût estimé : ${money(qty*unitCost(p))} · Marge brute estimée : ${money(qty*(price-unitCost(p)))}`;
  }
  document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.go)));
  $('saleProduct').addEventListener('change',updateSalePreview); ['saleQty','salePrice'].forEach(id=>$(id).addEventListener('input',updateSalePreview));
  $('saleDate').value=today(); $('salesFilterDate').value=today();
  $('saleForm').addEventListener('submit',e=>{e.preventDefault();const p=data.products.find(x=>x.id===$('saleProduct').value); if(!p){toast('Ajoute un plat avant d’enregistrer une vente.');return;}const qty=Math.max(1,Math.floor(Number($('saleQty').value)||1)),price=Math.max(0,Math.round(Number($('salePrice').value)||0)),saleDate=$('saleDate').value||today();data.sales.push({id:uuid(),date:saleDate,createdAt:new Date().toISOString(),productId:p.id,productName:p.name,qty,price,costUnit:unitCost(p),note:$('saleNote').value.trim(),cancelled:false});$('salesFilterDate').value=saleDate;save();$('saleQty').value=1;$('saleNote').value='';toast(`Vente enregistrée pour le ${saleDate}.`);});
  $('salesFilterDate').addEventListener('change',renderSales);
  $('showTodaySales').addEventListener('click',()=>{$('salesFilterDate').value=today();renderSales();});
  $('showAllSales').addEventListener('click',()=>{$('salesFilterDate').value='';renderSales();});
  $('newProductBtn').addEventListener('click',()=>openProductEditor()); $('closeProductEditor').addEventListener('click',()=>$('productEditor').hidden=true); $('cancelProductEdit').addEventListener('click',()=>$('productEditor').hidden=true);
  ['productPrice','productBatchCost','productYield','productMarginTarget'].forEach(id=>$(id).addEventListener('input',updateRecipeCalculation));
  $('productForm').addEventListener('submit',e=>{e.preventDefault();const id=$('productId').value;const old=data.products.find(p=>p.id===id);const p={id:id||uuid(),name:$('productName').value.trim(),category:$('productCategory').value.trim()||'Sans catégorie',price:Math.max(0,Math.round(Number($('productPrice').value)||0)),batchCost:Math.max(0,Math.round(Number($('productBatchCost').value)||0)),yield:Math.max(1,Math.floor(Number($('productYield').value)||1)),marginTarget:Math.max(0,Math.min(100,Number($('productMarginTarget').value)||0)),ingredients:$('productIngredients').value.trim(),active:old?old.active!==false:true}; if(old)data.products=data.products.map(x=>x.id===id?p:x);else data.products.push(p);save();$('productEditor').hidden=true;toast('Plat enregistré. Les calculs sont actualisés.');});
  $('productsTable').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-product]'),toggle=e.target.closest('[data-toggle-product]');if(edit){const p=data.products.find(x=>x.id===edit.dataset.editProduct);if(p)openProductEditor(p);}if(toggle){const p=data.products.find(x=>x.id===toggle.dataset.toggleProduct);if(p){p.active=p.active===false;save();toast(p.active?'Plat activé.':'Plat désactivé.');}}});
  $('salesTable').addEventListener('click',e=>{const btn=e.target.closest('[data-cancel-sale]');if(!btn)return;const s=data.sales.find(x=>x.id===btn.dataset.cancelSale);if(s&&!s.cancelled&&confirm(`Annuler la vente « ${s.productName} » de ${money(saleTotal(s))} ? L’opération sera conservée dans l’historique.`)){s.cancelled=true;s.cancelledAt=new Date().toISOString();save();toast('Vente annulée et conservée dans l’historique.');}});
  $('expenseDate').value=today();
  $('expenseForm').addEventListener('submit',e=>{e.preventDefault();data.expenses.push({id:uuid(),date:$('expenseDate').value||today(),createdAt:new Date().toISOString(),category:$('expenseCategory').value,amount:Math.max(0,Math.round(Number($('expenseAmount').value)||0)),description:$('expenseDescription').value.trim()});save();$('expenseAmount').value='';$('expenseDescription').value='';toast('Dépense enregistrée.');});
  $('expensesTable').addEventListener('click',e=>{const btn=e.target.closest('[data-delete-expense]');if(!btn)return;if(confirm('Supprimer cette dépense ? Cette action ne peut pas être annulée.')){data.expenses=data.expenses.filter(x=>x.id!==btn.dataset.deleteExpense);save();toast('Dépense supprimée.');}});
  $('settingsForm').addEventListener('submit',e=>{e.preventDefault();data.settings={name:$('settingName').value.trim()||'Mon Restaurant',owner:$('settingOwner').value.trim(),phone:$('settingPhone').value.trim(),currency:$('settingCurrency').value};save();toast('Paramètres enregistrés.');});
  $('reportStart').value=dateISO(new Date(new Date().getFullYear(),new Date().getMonth(),1)); $('reportEnd').value=today(); $('applyReport').addEventListener('click',renderReports); $('printReport').addEventListener('click',()=>{renderReports();window.print();});
  $('exportBackup').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...data,backupCreatedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`restopilot-sauvegarde-${today()}.json`;a.click();URL.revokeObjectURL(url);$('backupStatus').textContent='Sauvegarde téléchargée. Conserve-la sur un autre support sûr.';});
  $('importBackup').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed||!Array.isArray(parsed.products)||!Array.isArray(parsed.sales)||!Array.isArray(parsed.expenses)||!parsed.settings)throw new Error('Format invalide');if(!confirm('La restauration va remplacer les données actuellement sur cet appareil. Continuer ?'))return;data={version:1,settings:parsed.settings,products:parsed.products,sales:parsed.sales,expenses:parsed.expenses};save();$('backupStatus').textContent='Restauration terminée.';toast('Sauvegarde restaurée.');}catch(err){$('backupStatus').textContent='Impossible de restaurer ce fichier : format invalide ou fichier endommagé.';}finally{e.target.value='';}});
  $('resetDemo').addEventListener('click',()=>{if(confirm('Attention : toutes les ventes, dépenses et modifications de cet appareil seront effacées. As-tu téléchargé une sauvegarde ?')&&confirm('Confirmer une deuxième fois la réinitialisation ?')){data=starter();save();toast('Données réinitialisées avec les plats de démonstration.');}});
  function connectionStatus(){const el=$('connectionStatus');el.textContent=navigator.onLine?'Mode local · Internet disponible':'Hors connexion';el.classList.toggle('offline',!navigator.onLine);} window.addEventListener('online',connectionStatus);window.addEventListener('offline',connectionStatus);
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
  connectionStatus();renderAll();
})();
