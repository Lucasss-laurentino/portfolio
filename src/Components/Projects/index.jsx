import { useEffect, useState, useRef } from 'react';
import './index.css';

export const Projects = () => {
    const [projects, setProjects] = useState([
        {
            NOME: "Gestão de Barbearias",
            MIDIA: 'barbaCabelo&bigode.mp4',
            DESCRICAO: "Sistema de gestão para barbearias...",
            PATH_TO_REPO: 'https://github.com/Lucasss-laurentino/barbearia',
            TIPO: 'video'
        },
        {
            NOME: "Controle de Estoque",
            MIDIA: 'virtualize.mp4',
            DESCRICAO: "Sistema de Controle de Estoque...",
            PATH_TO_REPO: 'https://github.com/Lucasss-laurentino/front-virtualize',
            TIPO: 'video'
        },
        {
            NOME: "Sorteio de Prêmios",
            MIDIA: 'rifa.mp4',
            DESCRICAO: "Sistema permite que administradores criem sorteios...",
            PATH_TO_REPO: 'https://github.com/Lucasss-laurentino/raffle-folha-da-sorte',
            TIPO: 'video'
        },
        {
            NOME: "Ecommerce",
            MIDIA: 'ecommerce.gif',
            DESCRICAO: "Loja de vendas",
            PATH_TO_REPO: 'https://github.com/Lucasss-laurentino/ecommerce-front',
            TIPO: 'imagem'
        }
    ]);

    const cardsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        const direction = index % 2 === 0 ? "leftToRight" : "rightToLeft";
                        entry.target.classList.add(`card-projects-anime-${direction}`);
                    }
                });
            },
            { threshold: 0.3 }
        );

        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => {
            cardsRef.current.forEach((card) => {
                if (card) observer.unobserve(card);
            });
        };
    }, []);

    return (
        <div className="container-fluid div-projects">
            <div className="row">
                <div className="col-12 d-flex justify-content-center my-2 mb-4">
                    <h2 className="title-font">Projetos</h2>
                </div>
                <div className="row justify-content-around g-2">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            ref={(el) => (cardsRef.current[index] = el)}
                            className="card col-md-5 col-sm-12"
                        >
                            <div className="card-header">
                                {project.TIPO === 'video' ? (
                                    <video autoPlay loop muted className="video-responsive">
                                        <source src={project.MIDIA} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img src={project.MIDIA} alt={project.NOME} className="img-fluid" />
                                )}
                            </div>
                            <div className="card-description">
                                <h6>{project.NOME}</h6>
                                <p>{project.DESCRICAO}</p>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-md btn-custom m-3">
                                    <a href={project.PATH_TO_REPO} target="_blank" rel="noopener noreferrer" className="link-code">
                                        {"<Código/>"}
                                    </a>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
