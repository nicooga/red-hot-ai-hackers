'use client';

import { useState } from "react";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";

const MODEL_ID = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

const bedrock = createAmazonBedrock({
  region: "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
})

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("")

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <form onSubmit={onSubmit} className='flex flex-col border'>
        <textarea
          className='w-96 h-96'
          value={prompt}
          onChange={ev => setPrompt(ev.target.value)}
        />

        <button type='submit'>Submit</button>
      </form>

      <p className='border'>
        {response}
      </p>
    </div>
  );

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()

    setResponse('... Loading')

    try {
      const response = await generateText({
        model: bedrock(MODEL_ID),
        messages: [{ role: 'user', content: prompt }]
      })

      alert(response.text)

      setResponse(response.text)
    } catch (error) {
      if (error instanceof Error) {
        setResponse(error.message)
      }
    }
  }
}
