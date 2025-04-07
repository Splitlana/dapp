import React from "react";
import Container from "../container";
import { NewBillForm } from "../bills";

export const LandingPage = () => {
  return (
    <>
      <Container>
        <div className="flex gap-x-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Split<span className="text-[hsl(280,100%,70%)]">lana</span>
          </h1>
        </div>
      </Container>
      <div className="flex flex-col">
        <NewBillForm />
      </div>
    </>
  );
};
