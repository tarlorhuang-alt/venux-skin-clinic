import test from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
for(const kind of ['aftercare','receipt'])test(`${kind} QR decodes to the complete private link with a white quiet zone`,()=>{
 const path=`https://isaskinclinic.example/booking/${kind}/${'a'.repeat(kind==='receipt'?48:32)}`;
 const qr=QRCode.create(path,{errorCorrectionLevel:'M'}),scale=8,margin=4,size=(qr.modules.size+margin*2)*scale;
 const pixels=new Uint8ClampedArray(size*size*4).fill(255);
 for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x))for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){
  const index=(((y+margin)*scale+sy)*size+(x+margin)*scale+sx)*4;pixels[index]=pixels[index+1]=pixels[index+2]=0;
 }
 const decoded=jsQR(pixels,size,size);assert.equal(decoded?.data,path);
});
