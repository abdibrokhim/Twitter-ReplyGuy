
[initial prompt]

There is a meme kind of topic on twitter: "being a reply guy". So, let's create something around this topic and get viral. Let's build a tool that catches tweets with high engagement early on - and gives them to you (so that you can reply and get max traffic).
1. We will be using only shadcn ui components. For everything we must use Shadcn UI only: (@https://ui.shadcn.com/docs/components/accordion ).
2. Let's make somethign pretty viral with best UI/UX features.


[follow up]

Super Great!
1. Now integrate Twitter API v2: Here's Docs: @https://github.com/xdevplatform/Twitter-API-v2-sample-code . 
2. Use ypescript SDK: @https://docs.x.com/x-api/tools-and-libraries/sdks#authentication-flow . NPM: @https://www.npmjs.com/package/twitter-api-sdk .
PS: I already created an app and setup the all tokens inside `.env` file.


[follow up]

Bad news, Twitter API V2 is not working and has very low 1 request per 1 hour limit. 
Next plans:
1. Remove Twitter API calls and SDK.
2. We will be using OpenAI's new Agents SDK instead.
3. We build several high performing Agents for specific tasks; 
For example: 
1) Web Search (x.com) and Getting tweets. Up to 5 tweets. (customizable).
2) Formating the specific responses correctly in JSON structure.
3) and etc. tasks
4. We will also use specificly built Agents generate highly converting up to 3 replies. (customizable).
5. We will make "ReplyGuy" => AI Agentic App.
6. Use FastAPI for backend. 
7. Create or Delete or Update folders and files as per your needs. Go ahead!
8. OpenAI Agents SDK Docs: @https://openai.github.io/openai-agents-python/ref/agent/ . Github repo: @https://github.com/openai/openai-agents-python .

[follow up]

Great! 
Please refer to latest OpenAI Agents SDK and update Function Calling and other few things.
1. Function tools Docs: @https://openai.github.io/openai-agents-python/tools/#function-tools .
2. Agents; Basic configuration: @https://openai.github.io/openai-agents-python/agents/ .
3. Structured Outputs is a new capability in the Chat Completions API and Assistants API that guarantees the model will always generate responses that adhere to your supplied JSON Schema.: @https://cookbook.openai.com/examples/structured_outputs_intro .


[follow up]

1. Still you are using old documentation. Use OpenAI Agents SDK: @https://github.com/openai/openai-agents-python/blob/main/README.md .

2. Please refer to @AGENTS_DOCS.md . I placed there latest documentation to help you with building Multi-Agents.

[end]