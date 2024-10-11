import { useState } from "react";
import "./App.css";
import { Textarea } from "@/components/ui/textarea";
import GithubIcon from "./assets/github.svg";
import { AxiosToCurl } from "./utils/axios-curl";
import { Button } from "@/components/ui/button";

function App() {
  const [configInput, setConfigInput] = useState("");
  const [outputCurl, setOutputCurl] = useState("");
  const [copyState, setCopyState] = useState(false);

  const INPUT_PLACEHOLDER = `Enter your axios config object
Example:
{
  method: "POST",
  maxContentLength: Infinity,
  url: "https://www.google.com",
  headers: {
    "accept-encoding": "gzip, deflate",
  },
  data: {"test": "request body"}
}
  `;

  const hasValidBraces = (input: string): boolean => {
    const stack: string[] = [];
    for (const char of input) {
      if (char === "{") {
        stack.push(char);
      } else if (char === "}") {
        if (stack.length === 0 || stack.pop() !== "{") {
          return false;
        }
      }
    }
    return stack.length === 0;
  };

  const inputValidationCheck = (): boolean => {
    try {
      const cleanInput = configInput.replace(/\n/g, "").trim();
      if (!cleanInput.match(/^\{[\s\S]*\}$/) || !hasValidBraces(cleanInput)) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };
  const handleClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-unused-vars, prefer-const
    let obj: any = {};
    try {
      setOutputCurl("");

      if (!inputValidationCheck()) {
        throw new Error("invalid input");
      }

      // converting input into a javascript object
      const jsObject = eval("obj = " + configInput);

      const stringifyInput = JSON.stringify(jsObject);

      const config = JSON.parse(stringifyInput);

      const curl = new AxiosToCurl(config).generateCommand();

      setOutputCurl(curl);
    } catch (err) {
      setOutputCurl(
        "error: invalid axios config | if you think the input is valid, please report a bug 🚀"
      );
    }
  };

  const handleCopy = async () => {
    try {
      navigator.clipboard.writeText(outputCurl);
      setCopyState(true);
      setTimeout(() => {
        setCopyState(false);
      }, 1500);
    } catch (error) {
      return;
    }
  };

  return (
    <main className="h-screen p-0 flex flex-col justify-between">
      <div>
        <div className="h-4"></div>
        <div className="flex justify-between mt-7 px-2 lg:px-24 border-b pb-2 tracking-tight transition-colors first:mt-0">
          <h3 className="text-3xl font-semibold ">Axios To CuRL</h3>
        </div>
        <div className="flex flex-col items-center px-2 py-7">
          <div className="w-full">
            <Textarea
              className="h-[45vh] w-full"
              value={configInput.toString()}
              onChange={(e) => {
                setConfigInput(e.target.value);
              }}
              placeholder={INPUT_PLACEHOLDER}
            />
          </div>
          <div className="w-full m-7 flex justify-between items-center">
            <Textarea
              className="h-[7vh] max-h-16 resize-none"
              value={outputCurl}
              onChange={(e) => {
                setOutputCurl(e.target.value);
              }}
              placeholder="Output"
            />
            <Button
              className="hidden sm:block ml-3 h-[7vh] max-h-16"
              variant="outline"
              onClick={handleCopy}
            >
              {!copyState ? "Copy" : "Copied!"}
            </Button>
          </div>
          <Button variant="outline" onClick={handleClick} className="m-0">
            Convert
          </Button>
        </div>
      </div>
      <div className="m-0 py-2 flex justify-between px-2 lg:px-24 border-t pb-2 tracking-tight transition-colors">
        <div className="flex items-center">
          <p className="text-sm mx-2">© 2024</p>
        </div>
        <div className="flex items-center">
          <a
            href="https://github.com/gvarma28/axios-to-curl/issues"
            className="flex items-center"
          >
            <img src={GithubIcon} alt="Github" />
            <p className="text-sm mx-2">Report a bug</p>
          </a>
        </div>
      </div>
    </main>
  );
}

export default App;
