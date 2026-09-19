"use client";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, Card, Field, Input, Stat } from "@/components/ui";
const nf=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Math.max(0,n));
const num=(s:string)=>Number(s.replace(/[^0-9.,-]/g,"").replace(/\./g,"").replace(",","."))||0;
export default function FinanceTools(){
 const path=usePathname(); const [a,setA]=useState("10000000"),[b,setB]=useState("12"),[c,setC]=useState("10"),[d,setD]=useState("4"),[people,setPeople]=useState("2");
 const mode=path.split("/").pop();
 const title=({"pph-21":"Kalkulator PPh 21",zakat:"Kalkulator Zakat",kpr:"Kalkulator KPR & Cicilan","split-bill":"Split Bill","diskon-ppn":"Kalkulator Diskon & PPN",tabungan:"Kalkulator Tabungan"} as Record<string,string>)[mode||""]||"Kalkulator";
 const result=useMemo(()=>{const x=num(a), rate=num(c)/100, months=Math.max(1,num(b)), down=num(d)/100;
  if(mode==="pph-21"){const annual=Math.max(0,x*12-54000000), tax=Math.max(0,annual<=60000000?annual*.05:3000000+(annual-60000000)*.15);return {main:nf(tax/12),sub:`Perkiraan pajak setahun ${nf(tax)} (simulasi sederhana)`};}
  if(mode==="zakat")return {main:nf(x*.025),sub:"Perkiraan zakat maal 2,5% dari nilai yang dimasukkan"};
  if(mode==="kpr"){const principal=x*(1-down), monthly=rate?principal*(rate/12)/(1-Math.pow(1+rate/12,-months)):principal/months;return {main:nf(monthly),sub:`Pokok pinjaman ${nf(principal)} · ${months} bulan`};}
  if(mode==="split-bill")return {main:nf(x/Math.max(1,num(people))),sub:`Total ${nf(x)} dibagi ${Math.max(1,num(people))} orang`};
  if(mode==="diskon-ppn"){const after=x*(1-num(c)/100)*(1+num(d)/100);return {main:nf(after),sub:`Harga awal ${nf(x)} · diskon ${c}% · PPN ${d}%`};}
  const future=x*Math.pow(1+rate,months)+num(d)*months;return {main:nf(future),sub:`Modal ${nf(x)} · bunga ${c}% · ${months} periode`};
 },[a,b,c,d,people,mode]);
 const labels=mode==="split-bill"?["Total tagihan","Jumlah orang"]:mode==="diskon-ppn"?["Harga awal","Diskon (%)","PPN (%)"]:mode==="zakat"?["Nilai harta/penghasilan"]:["Nilai utama",mode==="kpr"?"Tenor (bulan)":"Periode",mode==="kpr"?"Bunga tahunan (%)":"Bunga (%)"];
 return <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]"><Card title={title}><div className="grid gap-4 sm:grid-cols-2"><Field label={labels[0]}><Input value={a} onChange={e=>setA(e.target.value)} inputMode="decimal"/></Field>{labels[1]&&<Field label={labels[1]}><Input value={mode==="split-bill"?people:b} onChange={e=>(mode==="split-bill"?setPeople:setB)(e.target.value)} inputMode="decimal"/></Field>}{labels[2]&&<Field label={labels[2]}><Input value={mode==="diskon-ppn"?d:c} onChange={e=>(mode==="diskon-ppn"?setD:setC)(e.target.value)} inputMode="decimal"/></Field>}{mode==="kpr"&&<Field label="Uang muka (%)"><Input value={d} onChange={e=>setD(e.target.value)} inputMode="decimal"/></Field>}{mode==="tabungan"&&<Field label="Setoran rutin / periode"><Input value={d} onChange={e=>setD(e.target.value)} inputMode="decimal"/></Field>}</div><Button className="mt-5" onClick={()=>{setA(a.trim());setB(b.trim())}}>Hitung</Button></Card><Card title="Hasil"><Stat label={mode==="split-bill"?"Per orang":"Perkiraan hasil"} value={result.main}/><p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{result.sub}</p></Card></div>;
}
