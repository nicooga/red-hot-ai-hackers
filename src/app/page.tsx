'use client';

import { useState } from "react";
import ProposalGeneration from "./lib/ProposalGeneration";

export default function Home() {
  const [input, setInput] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <form
        className='flex flex-col border'
        onSubmit={onSubmit}
      >
        <textarea onChange={ev => setInput(ev.target.value)} rows={10} />
        <button type='submit'>Submit</button>
      </form>

      <p className='border'>
      </p>
    </div>
  );

  // async function onFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
  //   const file = ev.target.files?.[0]
  //   if (!file) { return }
  //   setFile(file)
  // }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const result = await ProposalGeneration.generateCampaignProposal(JSON.parse(input))
    console.log("SUCESS!!", result)
    alert("SUCESS!!")
  }
}

// function parseCsvToRecords(
//   text: string,
// ): Promise<Record<string, string>[]> {
//   return new Promise((resolve, reject) => {
//     const out: Record<string, string>[] = [];
//     parseString(text, { headers: true })
//       .on('error', reject)
//       .on('data', (row: Record<string, string>) => out.push(row))
//       .on('end', () => resolve(out));
//   });
// }