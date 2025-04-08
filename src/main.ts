import { readFileSync } from "fs";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { ListenOptions } from "net";
import { MIME_TYPES } from "./constants.js";
import { ContentType, Encoding, StatusCode } from "./enums.js";
import { isKeyOf } from "./utils.js";

/** TODO: Create unit tests for keywords and types being decoarted as object keys. Ex. { keyof: string, string: "Hi" }*/
/** TODO: Create unit tests for symbols,types and keywords not being decorated inside a string literal type. Ex. type MyType = " A <span> tag; number string keyof " */
/** TODO: Create unit tests for matching brackets and braces decorated with the same color. Ex: type Nested = {one: {two: {three: []}}}*/
/** TODO: Execute prettier command after declaration files has been emitted.*/
/** TODO: Read all files in declaration directory.*/
/** TODO: Decorate enum definition seperately.*/

/** All types are valid since we're using the tsc to emit the declaration files. */
const handleRequest = async (
  request: IncomingMessage,
  response: ServerResponse
) => {
  /** Generate html files and landing page */

  if (request.url) {
    switch (true) {
      case /^\/dist\//.test(request.url): {
        const match = request.url.match(/^\/dist\/(.+\.(.+))/i);

        if (!match) return;

        const [_, fileName, fileType] = match;

        if (!isKeyOf(MIME_TYPES, fileType)) return;

        response.writeHead(StatusCode.Success, {
          "content-type": MIME_TYPES[fileType],
        });

        const file = readFileSync(`./dist/${fileName}`, {
          encoding: Encoding.Utf8,
        });

        response.end(file);
        return;
      }

      case /^\/assets\//.test(request.url): {
        const match = request.url.match(/(.*\/)(.+\.(.+))/i);

        if (!match) return;

        const [_, filePath, fileName, fileType] = match;

        if (!isKeyOf(MIME_TYPES, fileType)) return;

        response.writeHead(StatusCode.Success, {
          "content-type": MIME_TYPES[fileType],
        });

        const file = readFileSync(`./${filePath}${fileName}`, {
          encoding: Encoding.Utf8,
        });

        response.end(file);
        return;
      }
    }
  }

  switch (request.url) {
    case "/":
      response.writeHead(StatusCode.Success, {
        "Content-Type": ContentType.Html,
      });
      const html = readFileSync("./src/index.html", {
        encoding: Encoding.Utf8,
      });
      response.end(html);
      break;

    case "/styles/index.css": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync("./src/styles/index.css", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/styles/dashboard.css": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync("./src/styles/dashboard.css", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/styles/type-definition.css": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync(
        "./src/styles/type-definition.css",
        Encoding.Utf8
      );
      response.end(file);
      break;
    }

    case "/fonts/Monaco.woff": {
      response.writeHead(200, { "Content-Type": ContentType.FontWoff });
      const file = readFileSync("./src/fonts/Monaco.woff", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/dist/bundle.js": {
      response.writeHead(200, { "Content-Type": ContentType.Javascript });
      const file = readFileSync("./dist/bundle.js", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/data.json": {
      response.writeHead(200, { "Content-Type": ContentType.Json });
      const file = readFileSync("./data.json", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/styles/nav-bar.css": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync("./src/styles/nav-bar.css", Encoding.Utf8);
      response.end(file);
      break;
    }

    case "/services/create-nav-bar.ts": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync(
        "./src/services/create-nav-bar.ts",
        Encoding.Utf8
      );
      response.end(file);
      break;
    }

    case "/dist/output.css": {
      response.writeHead(200, { "Content-Type": ContentType.Css });
      const file = readFileSync("./dist/output.css", Encoding.Utf8);
      response.end(file);
      break;
    }
  }

  // else {
  //   if (
  //     !request.url ||
  //     request.url === "/favicon.ico" ||
  //     request.url === "/fonts/Monaco.woff"
  //   )
  //     return;

  //   response.writeHead(200, { "Content-Type": "text/html" });
  //   const file = readFileSync(
  //     `./type-spector-emit/html/${request.url.slice(1)}.html`,
  //     {
  //       encoding: "utf-8",
  //     }
  //   );
  //   response.end(file);
  // }
};

const server = createServer(handleRequest);

const LISTEN_OPTIONS = {
  port: 8000,
  host: "localhost",
} as const satisfies ListenOptions;

server.listen(LISTEN_OPTIONS, () => {
  console.info("Listening, http://localhost:8000");
});
