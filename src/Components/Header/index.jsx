import './index.css';
import { AnimatedText } from './TextAnimated';

export const Header = () => {
    
    return (
        <>
            <div className="container-fluid p-0">
                <div className="navbar d-none d-md-flex">
                    <div className="col-3 d-flex justify-content-center">
                        <a href="https://github.com/Lucasss-laurentino" target='_blank'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#4fc3dc" className="bi bi-github github-icon mx-2" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/in/lucas-j-156154210/" target='_blank'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4fc3dc" className="bi bi-linkedin github-icon mx-2" viewBox="0 0 16 16">
                                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <div className="col-12 bubbles">
                    <div className="col-12 col-sm-6 d-flex">
                        <span style={{ '--i': 62 }}></span>
                        <span style={{ '--i': 58 }}></span>
                        <span style={{ '--i': 61 }}></span>
                        <span style={{ '--i': 63 }}></span>
                        <span style={{ '--i': 52 }}></span>
                        <span style={{ '--i': 65 }}></span>
                        <span style={{ '--i': 63 }}></span>

                        <span style={{ '--i': 50 }}></span>
                        <span style={{ '--i': 68 }}></span>
                        <span style={{ '--i': 64 }}></span>
                        <span style={{ '--i': 66 }}></span>
                        <span style={{ '--i': 52 }}></span>
                        <span style={{ '--i': 54 }}></span>
                    </div>
                    <div className="col-6 d-none d-sm-flex">
                        <span style={{ '--i': 62 }}></span>
                        <span style={{ '--i': 58 }}></span>
                        <span style={{ '--i': 61 }}></span>
                        <span style={{ '--i': 63 }}></span>
                        <span style={{ '--i': 52 }}></span>
                        <span style={{ '--i': 65 }}></span>
                        <span style={{ '--i': 63 }}></span>


                        <span style={{ '--i': 50 }}></span>
                        <span style={{ '--i': 68 }}></span>
                        <span style={{ '--i': 64 }}></span>
                        <span style={{ '--i': 66 }}></span>
                        <span style={{ '--i': 52 }}></span>
                        <span style={{ '--i': 54 }}></span>
                    </div>
                </div>
                <div className="col-12 div-text-animated text-white">
                    <div className="col-12 d-block d-md-none d-flex justify-content-center">
                        <div className="div-photo div-circle">
                            <img src="/perfil.jpeg" alt="" className="img-fluid" />
                        </div>
                    </div>
                    <div className="col-12 col-md-7 margin-left responsive-text-animated">
                        <h2 className='text-animated'>
                            Desenvolvedor <AnimatedText/>
                        </h2>
                        <p className='col-12 col-sm-10 m-0'>
                            Sou um desenvolvedor apaixonado por tecnologia e inovação, com experiência em criar soluções completas e eficientes.
                        </p>
                        <button className='btn btn-md btn-custom'>
                            <a href="curriculo.pdf" download={"Currículo: Lucas de Jesus Laurentino"} className='link-code'>
                                Baixar Currículo
                            </a>
                        </button>
                    </div>
                    <div className="col-5 d-none d-md-block d-flex justify-content-center">
                        <div className="div-photo div-circle">
                            <img src="/perfil.jpeg" alt="" className="img-fluid" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}