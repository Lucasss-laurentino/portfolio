import { useEffect, useState } from 'react';
import './index.css';

export const Projects = () => {
    const [scrollY, setScrollY] = useState(0);

    const [projects, setProjects] = useState([
        {
            'NOME': "Gestão de Barbearias",
            'IMG': 'barbaCabelo&bigode.mp4',
            'DESCRICAO': "Sistema de gestão para barbearias com página personalizada para cada assinante. Clientes agendam horários sem login via link da barbearia, escolhendo serviço e barbeiro. Admins aceitam ou recusam agendamentos em tempo real via WebSocket. Pagamentos via Pix antes do agendamento e assinaturas recorrentes pelo PagBank com 15 dias de teste grátis.",
            'PATH_TO_REPO': 'https://github.com/Lucasss-laurentino/barbearia'
        },
        {
            'NOME': "Controle de Estoque",
            'IMG': 'virtualize.mp4',
            'DESCRICAO': "Sistema de Controle de Estoque com relatórios de financeiros detalhados, cadastro completo de produtos, fornecedores e transporte, registro de vendas e reposições de estoque em tempo real, monitoramento preciso para evitar perdas e otimizar reposições, Ideal para empresas que buscam praticidade, organização e controle total do estoque, garantindo decisões mais estratégicas e crescimento sustentável",
            'PATH_TO_REPO': 'https://github.com/Lucasss-laurentino/front-virtualize'
        },
        {
            'NOME': "Sorteio de Prêmios",
            'IMG': 'rifa.mp4',
            'DESCRICAO': " sistema permite que administradores criem sorteios exclusivos, onde um prêmio é definido e uma quantidade limitada de números é disponibilizada para venda. O dono do sorteio gerencia a distribuição desses números, garantindo transparência e segurança em cada etapa.",
            'PATH_TO_REPO': 'https://github.com/Lucasss-laurentino/raffle-folha-da-sorte'
        }
    ]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        console.log(scrollY);
        if (scrollY >= 600) {
            const elementos = document.getElementsByClassName("card");
            for (let i = 0; i < elementos.length; i++) {
                if (i === 0) {
                    elementos[i].setAttribute("class", "card col-sm-5 card-projects-anime-left-to-right")
                }
                if (i === 1) {
                    elementos[i].setAttribute("class", "card col-sm-5 card-projects-anime-right-to-left")
                }
            }
        }

        if (scrollY >= 1368) {

            const elementos = document.getElementsByClassName("card");
            for (let i = 0; i < elementos.length; i++) {
                if (i === 2) {
                    elementos[i].setAttribute("class", "card col-sm-5 card-projects-anime-left-to-right")
                }
                if(i === 3) {
                    elementos[i].setAttribute("class", "card col-sm-5 card-projects-anime-right-to-left")
                }
            }
        }

    }, [scrollY]);

    return (
        <>
            <div className="container-fluid div-projects">
                <div className="row">
                    <div className="col-12">
                        <div className="col-12 d-flex justify-content-center my-2 mb-4">
                            <h2 className='title-font'>Projetos</h2>
                        </div>
                        <div className="row justify-content-around g-2">
                            {
                                projects.map((project) => {
                                    return (
                                        <div className="card col-sm-5">
                                            <div className="card-header col-12 d-flex justify-content-center align-items-center flex-column">
                                                <video autoPlay loop muted className='video-responsive'>
                                                    <source src={project.IMG} type='video/mp4' />
                                                </video>
                                            </div>
                                            <div className="col-12 card-description">
                                                <h6>{project.NOME}</h6>
                                                <p className="m-0">
                                                    {project.DESCRICAO}
                                                </p>
                                            </div>
                                            <div className="col-12 card-footer">
                                                <button className='btn btn-md btn-custom m-3'>
                                                    <a href={`${project.PATH_TO_REPO}`} target='_blank' className='link-code'>
                                                        {"<Código/>"}
                                                    </a>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            <div className="card col-sm-5">
                                <div className="card-header col-12 d-flex justify-content-center align-items-center flex-column">
                                    <img src="ecommerce.gif" alt="" className="img-fluid" />
                                </div>
                                <div className="col-12 card-description">
                                    <h6>Ecommerce</h6>
                                    <p className="m-0">
                                    </p>
                                </div>
                                <div className="col-12 card-footer">
                                    <button className='btn btn-md btn-custom m-3'>
                                        <a href="https://github.com/Lucasss-laurentino/ecommerce-front" target='_blank' className='link-code'>
                                            {"<Código/>"}
                                        </a>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}