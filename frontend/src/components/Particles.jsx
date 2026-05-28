import { useEffect } from "react";

const Particles = () => {
  useEffect(() => {
    const container = document.getElementById("particles");
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.animationDelay = Math.random() * 8 + "s";
      p.style.animationDuration = Math.random() * 10 + 5 + "s";
      container.appendChild(p);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div className="particles" id="particles"></div>;
};

export default Particles;
