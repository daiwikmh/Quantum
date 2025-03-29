import { Features } from "@/components/features";
import Footer from "@/components/footer";
import { Header1 } from "@/components/header"
import { HeroScrollDemo } from "@/components/scroll";

function HomeBeforeLogin() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header1 />
      <main className="flex-grow">
        {/* Main content goes here */}
      </main>
      <HeroScrollDemo/>
      <Features/>
      <Footer />
    </div>
  );
}

export default HomeBeforeLogin;

