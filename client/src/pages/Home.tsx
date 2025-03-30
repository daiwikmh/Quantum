import Bento from "@/components/bento";
import Footer from "@/components/footer";
import Header1 from "@/components/header";
import { HeroScrollDemo } from "@/components/scroll";
import Marquee from "@/components/ui/marquee";

function HomeBeforeLogin() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header1 />
      <main className="flex-grow">{/* Main content goes here */}</main>
      <div className="mt-8">
        <HeroScrollDemo />
      </div>
      <div className="mt-16 mb-32">
        <Bento />
      </div>
      <Marquee />
      <Footer />
    </div>
  );
}

export default HomeBeforeLogin;
