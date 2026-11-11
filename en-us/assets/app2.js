// Loona QR Codes — variant builders (payments, contact formats, calls, 2FA).
// Loaded after app.js on variant pages; extends BUILDERS without touching app.js.
function ethToWei(eth){ eth=String(eth||'').trim(); if(!eth) return ''; var neg=eth[0]==='-'; if(neg) eth=eth.slice(1);
  var parts=eth.split('.'); var whole=parts[0].replace(/\D/g,'')||'0'; var frac=((parts[1]||'').replace(/\D/g,'')+'000000000000000000').slice(0,18);
  var wei=(whole+frac).replace(/^0+(?=\d)/,''); return (neg?'-':'')+wei; }
function money(v){ v=String(v||'').trim().replace(',','.'); return v; }
BUILDERS.ethereum=function(d){ var w=ethToWei(money(d.amount)); return 'ethereum:'+trim(d.address)+(w?('?value='+w):''); };
BUILDERS.litecoin=function(d){ var q=[]; if(d.amount)q.push('amount='+enc(money(d.amount))); if(d.label)q.push('label='+enc(d.label)); return 'litecoin:'+trim(d.address)+(q.length?'?'+q.join('&'):''); };
BUILDERS.dogecoin=function(d){ var q=[]; if(d.amount)q.push('amount='+enc(money(d.amount))); if(d.label)q.push('label='+enc(d.label)); return 'dogecoin:'+trim(d.address)+(q.length?'?'+q.join('&'):''); };
BUILDERS.bitcoincash=function(d){ var q=[]; if(d.amount)q.push('amount='+enc(money(d.amount))); if(d.label)q.push('label='+enc(d.label)); return 'bitcoincash:'+trim(d.address)+(q.length?'?'+q.join('&'):''); };
BUILDERS.xrp=function(d){ var q=[]; if(d.tag)q.push('dt='+enc(d.tag)); if(d.amount)q.push('amount='+enc(money(d.amount))); return 'ripple:'+trim(d.address)+(q.length?'?'+q.join('&'):''); };
BUILDERS.solana=function(d){ var q=[]; if(d.amount)q.push('amount='+enc(money(d.amount))); if(d.label)q.push('label='+enc(d.label)); if(d.message)q.push('message='+enc(d.message)); if(d.memo)q.push('memo='+enc(d.memo)); return 'solana:'+trim(d.address)+(q.length?'?'+q.join('&'):''); };
BUILDERS.sepa=function(d){ var amt=money(d.amount); var lines=['BCD','002','1','SCT',trim(d.bic),trim(d.name).slice(0,70),trim(d.iban).replace(/\s/g,'').toUpperCase(),amt?('EUR'+Number(amt).toFixed(2)):'','']; if(trim(d.reference)){ lines.push(trim(d.reference).replace(/\s/g,'')); } else { lines.push(trim(d.text).slice(0,140)); } return lines.join('\n'); };
BUILDERS.venmo=function(d){ var u=trim(d.username).replace(/^@/,''); var q=['txn=pay']; if(d.amount)q.push('amount='+enc(money(d.amount))); if(d.note)q.push('note='+enc(d.note)); return 'https://venmo.com/'+u+'?'+q.join('&'); };
BUILDERS.cashapp=function(d){ var t=trim(d.cashtag).replace(/^\$/,''); return 'https://cash.app/$'+t+(trim(d.amount)?('/'+money(d.amount)):''); };
BUILDERS.zelle=function(d){ return 'Payment Information\nMethod: Zelle\nName: '+trim(d.name)+'\nSend to (email or mobile): '+trim(d.contact)+(trim(d.note)?'\nNote: '+trim(d.note):''); };
function escMe(s){ return trim(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/:/g,'\\:').replace(/,/g,'\\,'); }
BUILDERS.mecard=function(d){ var p=['MECARD:']; if(d.name)p.push('N:'+escMe(d.name)+';'); if(d.phone)p.push('TEL:'+trim(d.phone)+';'); if(d.email)p.push('EMAIL:'+trim(d.email)+';'); if(d.org)p.push('ORG:'+escMe(d.org)+';'); if(d.website)p.push('URL:'+ensureUrl(d.website)+';'); if(d.address)p.push('ADR:'+escMe(d.address)+';'); if(d.note)p.push('NOTE:'+escMe(d.note)+';'); p.push(';'); return p.join(''); };
BUILDERS.skype=function(d){ return 'skype:'+trim(d.username)+'?'+(d.action||'call'); };
function dtG(v){ v=trim(v); if(!v) return ''; return v.replace(/[-:]/g,'')+(v.length===16?'00':''); }
BUILDERS.gcal=function(d){ var q=['action=TEMPLATE','text='+enc(d.title)]; if(d.start)q.push('dates='+dtG(d.start)+'/'+dtG(d.end||d.start)); if(d.details)q.push('details='+enc(d.details)); if(d.location)q.push('location='+enc(d.location)); return 'https://calendar.google.com/calendar/render?'+q.join('&'); };
BUILDERS.otpauth=function(d){ var secret=trim(d.secret).replace(/\s/g,'').toUpperCase(); var label=enc(trim(d.issuer)+':'+trim(d.account)); var q=['secret='+secret]; if(d.issuer)q.push('issuer='+enc(d.issuer)); q.push('algorithm=SHA1'); q.push('digits='+(d.digits||'6')); q.push('period=30'); return 'otpauth://totp/'+label+'?'+q.join('&'); };
BUILDERS.facetime=function(d){ return 'facetime:'+trim(d.contact); };
