import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Particles from "../components/Particles";
import AshokaBackground from "../components/AshokaBackground";
import TechStack from "../components/TechStack";

const Landing = () => {
  return (
    <>
      <Particles />
      <AshokaBackground />
      <Navbar />
      <Hero />
      <Features />
      <TechStack />
      <Footer />
    </>
  );
};

export default Landing;
