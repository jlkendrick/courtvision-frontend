import Header from "../components/Header";
import { LoginForm } from "../components/LoginForm";
import LeagueInfoForm from "../components/LeagueInfoForm";
import { FeatureCard1 } from "../deprecated/FeatureCard1";
import { FeatureCard2 } from "../deprecated/FeatureCard2";
import { Separator } from "../components/ui/separator";

export default function Home() {
  return (
    <>
      <main className="p-4">
        <Header />
      </main>

      {/* <section className="py-10 flex flex-wrap justify-center gap-20"> */}
      <section className="py-5 flex justify-center">
        <div className="flex flex-col w-full max-w-md">
          <LeagueInfoForm />
        </div>
        {/* <div className="flex flex-col items-center justify-center w-1/4">
        <LeagueInfoForm />
      </div>

      <div className="flex flex-col items-center gap-1 w-3/4">
        <h1 className="text-2xl">Welcome to Court Visionaries</h1>
        <p>Advanced tools to help you win your fantasy basketball league</p>

        <Separator orientation="horizontal" className="w-3/4 my-4 bg-primary" />

        <FeatureCard1 />
        <FeatureCard2 />
      </div> */}
      </section>
    </>
  );
}
