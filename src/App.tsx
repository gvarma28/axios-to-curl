import { useState } from "react";
import "./App.css";
import { Textarea } from "@/components/ui/textarea";
// import { AxiosRequestConfig } from "axios";
import { axiosToCurl } from "./utils/axios-curl";
import { Button } from "@/components/ui/button";

function App() {
  const [configInput, setConfigInput] = useState("");
  const [outputCurl, setOutputCurl] = useState("");

  // const testconfig: AxiosRequestConfig = { // eslint-disable-line @typescript-eslint/no-unused-vars
  //   method: "get",
  //   maxContentLength: Infinity,
  //   url: "https://www.mymoto.com.au/cars?sort=newest",
  //   headers: {
  //     "accept-encoding": "gzip, deflate",
  //   },
  //   // data: {"test": "abc"}
  // };

  const handleClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = {};
    try {
      obj = null;

      setOutputCurl("");

      // :TODO write some security measures before calling eval

      // converting input into a javascript object
      const jsObject = eval("obj = " + configInput);

      const stringifyInput = JSON.stringify(jsObject);

      const config = JSON.parse(stringifyInput);

      const curl = axiosToCurl(config);

      console.log(outputCurl);
      setOutputCurl(curl);
    } catch (error) {
      console.log(error, obj);
      setOutputCurl("Error: Invalid axios config");
    }
  };

  return (
    <>
      <h3 className="flex mt-10 px-2 lg:px-24 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        axios to curl 
      </h3>
      {/* <main className="flex min-h-screen flex-col items-center justify-between px-24 py-12 max-p-[20px]"> */}
      {/* <main className="flex min-h-screen flex-col items-center px-24 py-12 sm:px-0 md:px-0"> */}
      <main className="flex min-h-screen flex-col items-center px-2 py-7 lg:px-24 lg:py-12">
        <div className="w-full">
          <Textarea
            className="h-96 w-full"
            value={configInput.toString()}
            onChange={(e) => {
              setConfigInput(e.target.value);
            }}
            placeholder="Enter your axios config object"
          />
        </div>
        <div className="w-full m-10">
          <Textarea
            className="h-20 resize-none"
            value={outputCurl}
            onChange={(e) => {
              setOutputCurl(e.target.value);
            }}
            placeholder="Curl Output"
          />
        </div>
        <Button variant="outline" onClick={handleClick}>
          Let's Go
        </Button>
      </main>
    </>
  );
}

export default App;
