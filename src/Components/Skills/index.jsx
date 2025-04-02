import { useEffect, useState } from "react";
import "./index.css";

export const Skills = () => {
  const [visibleCards, setVisibleCards] = useState({
    frontend: false,
    languages: false,
    backend: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".card-skills").forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          setTimeout(() => {
            setVisibleCards((prev) => ({
              ...prev,
              [card.dataset.id]: true,
            }));
          }, index * 300); // Delay de 300ms entre cada card
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="container-fluid div-skills">
      <div className="row justify-content-center">
        <div className="col-12 text-center">
          <h2 className="title-font">Skills</h2>
        </div>

        <div className="col-12 d-flex flex-wrap justify-content-center">
          <div
            className={`card-skills ${visibleCards.frontend ? "visible" : ""}`}
            data-id="frontend"
          >
            <h4>Front-end</h4>
            <div className="icons">
              <img src="/icones/html.png" alt="HTML" />
              <img src="/icones/css-3.png" alt="CSS" />
              <img src="/icones/bootstrap.png" alt="Bootstrap" />
              <img src="/icones/react.png" alt="React" />
              <img src="/icones/nextjs.png" alt="Next.js" />
            </div>
          </div>

          <div
            className={`card-skills ${visibleCards.languages ? "visible" : ""}`}
            data-id="languages"
          >
            <h4>Linguagens</h4>
            <div className="icons">
              <img src="/icones/js.png" alt="JavaScript" />
              <img src="/icones/typescript.png" alt="TypeScript" />
              <img src="/icones/c-sharp.png" alt="C#" />
            </div>
          </div>

          <div
            className={`card-skills ${visibleCards.backend ? "visible" : ""}`}
            data-id="backend"
          >
            <h4>Back-end</h4>
            <div className="icons">
              <img src="/icones/node.png" alt="Node.js" />
              <img src="/icones/mysql.png" alt="MySQL" />
              <img src="/icones/docker.png" alt="Docker" />
              <img src="/icones/jwt.png" alt="JWT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
