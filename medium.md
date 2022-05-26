Deno in production by Steven de Salas (LetMePark)

TL/DR: The hot new JavaScript runtime by Ryan Dahl is sleek, powerful and easy to use. Most importantly, it is TypeScript native with a mixed usage model so you can transition your codebase from JS to TS at your own pace without transpilation or magicware. The smaller ecosystem compared to Node.js limits your use cases, so it really depends on what you want to use it for, but this is not all bad news, a smaller ecosystem can also mean your project does not get bloated with dependencies. Teams thinking of making the switch over to Golang might want to consider it before going ahead, as it provides a lot of overlap in terms of use cases.

Hiya, my name is Steven de Salas. I’ve been the Founding Engineer and CTO for a Series-A startup in Madrid and we’ve been running Deno in production for a little under a year.

We are mostly a JavaScript shop running Node.js services and I wanted to comment on my experience setting up a Deno API service and running it. You’re probably busy so I’ll try be as brief as possible. Feel free to write a comment if you want some further clarification.

WHAT IS DENO.JS:

‘Deno’ (‘No-de’ flipped over) is a new JavaScript runtime announced in 2018 by the Node.js creator Ryan Dahl after commiserating his mistakes in a now-famous presentation.

Its basically a re-write of the Node.js JavaScript engine (famous for bringing server-side JavaScript to the masses) and its been getting a fair bit of traction lately. You can read more about it in Wikipedia.

WHAT WE USED DENO FOR:

We used Deno for API integration mainly. Our startup distills information and interacts with many parking providers and most have some sort of JSON API we can talk to, other times we rely on information provided by their website. Its all HTTP in any case. Easily solved with fetch() calls under the hood.

Our stack is essentially: Deno on dockerised Debian, with Oak for Web/API framework and SuperOak for testing. With various libraries added as needed. All running as load-balanced containers hosted in AWS.

❤️ WHAT WE LOVED:

    Native TypeScript. No need to fiddle with ts-node, babel, esbuild or any of the other ways to fit a (TS) square peg into a (Node.js) round hole. TypeScript is supported by Deno natively. There is no setup, config or instructions needed. It just works. We used TS for all our libraries and core utility scripts, and JS for the routes. Interoperability is pretty seamless, just change the file extension to .ts and you are good to go.

👍 WHAT ELSE WAS GREAT:

    Stable in production. Never had a hitch with the process. The loads were not huge but it was a critical part of our infrastructure and it ran smoothly all along to the point you forget its even there doing its job.
    Simple to package. Due to its single executable and easily accessible Docker Images, Deno is a breeze to package for production. Even when the docker images were not published, a simple Dockerfile based ondebian:slim with installation script will run your code without a problem.

👎 THINGS THAT WERE ANNOYING OR MISSING:

    Less mature ecosystem. Lets face it, Node.js has NPM so whatever problem your are facing your are usually one npm install away from solving it. This can be annoying with Deno, but it does force you to be minimal about dependencies… a little too much npm install can also ruin your project. For example, if you want to create automated tests for your API, there are 20 different ways you can go about it in Node.js. In Deno you have less choice or you have to build your own. We ended up going with superoak.

🤘 WHAT WAS A BIT HYPED:

    Security model. Deno.js is touted as having a superior security model to Node.js, where permissions are explicitly declared at run-time and enforced by the executable. While this sounds great in theory, the practice of running a real-world use-case such as an API service is that as the project expands and your needs change, you will just keep adding permissions to the main executable in your startup-script. This means that the needs of a single execution pathway (ie GET /document/{documentId}) will also apply to EVERY OTHER execution pathway, so little is gained overall, particularly as projects expand and become more complex. There are ways around this, but honestly, I think it would have been more useful for run-time permissions to be applied to each file on a case-by-case basis.

🤔 PROBLEMS:

    Complex dependencies. The only significant problem we faced was when trying to upgrade our service to include the Chromium's Puppeteer runtime in our deployment. I think this problem would have occurred with Node.js as well. Running a fully-fledged browser as a background process has too many platform-specific requirements in terms of libraries and settings to get right, as well as a forked process running in the background. Components like these tend to make solutions a bit more delicate. We could have got it running given enough time but it was not worth the effort as there were other ways to accomplish what we were after without a headless browser.

WHO WOULD WANT TO USE IT?

Lets face it. A project like this only gains traction because people want to use it. I’ve noticed that Golang has taken a lot of steam out of Node.js for the middle-tier lately.

And why? To me it seems like the main reasons overlap a fair bit with the use-cases for Deno.js.

    Bloatware: Projects written in Node.js suffer from a plethora of unsecured dependencies. Just try npm audita project older than 6 months. This has become worse lately, and its not that Golang or Deno do not suffer from security issues too, just they have far less dependencies to worry about.
    Standardized way of doing certain things: Golang has opinionated linting, testing, and dependency management. Same as Deno.
    Type safety. Golang provides strong types but the syntactic overhead is also fairly light. TypeScript in Deno is not exactly ‘type safe’ but it does overlap a bit in terms of requirements.
    Barrier to entry: Node.js is too easy to get started. This means that the pool of available programmers is not the highest quality. Runtimes like Go or Deno are still havens for the ‘connoisseur’ programmer.

In my opinion Deno should interest senior developers working in projects that are tired of the Node.js ecosystem, but want to use a similar runtime instead of moving their codebase to Golang.

If you are after something minimal, and don’t mind coding your way around certain problems it really provides an excellent platform. I would start with simple use-cases (like we did) and then move on to more complex ones on a case-by-case basis.