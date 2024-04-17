import Head from "next/head";
import Header from "../components/Header";
import LeagueInfoForm from "../components/LeagueInfoForm";

export default function Home() {
  return (
    <>
      <Head>
        <title>Court Visionaries</title>
        <meta
          name="description"
          content="Court Visionaries provides advanced tools to help you win your fantasy basketball league."
        />
        <meta
          name="keywords"
          content="fantasy basketball, fantasy sports, lineup optimization, fantasy streaming"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

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
