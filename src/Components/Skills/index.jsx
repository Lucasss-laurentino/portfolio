import { useEffect, useState } from 'react';
import './index.css';

export const Skills = () => {

    const [scrollY, setScrollY] = useState(0);

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
        if(scrollY >= 200) {
            console.log(scrollY);
            const elementos = document.getElementsByClassName("card-skills");
            for (let i = 0; i < elementos.length; i++) {
                elementos[i].setAttribute("class", "card-skills card-skills-anime")
            }
        }
      }, [scrollY]);
    
    return (
        <>
            <div className="container-fluid div-skills">
                <div className="row">
                    <div className="col-12 p-0">
                       <div className="col-12 d-flex justify-content-center align-items-center">
                        <h2 className='title-font'>Skills</h2>
                       </div>
                       <div className="col-12 d-flex position-relative" style={{height: '340px'}}>
                            <div className="card-skills" style={{'--i': 1}}>
                                <div className="col-12 d-flex justify-content-center">
                                    <h4>Front-end</h4>
                                </div>
                                <div className="col-12 d-flex justify-content-center" style={{marginTop: "20px"}}>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/html.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/css-3.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/bootstrap.png" className='img-fluid' alt="" />
                                    </div>

                                </div>
                                <div className="col-12 d-flex justify-content-center" style={{marginTop: "20px"}}>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/react.png" width={"100%"} className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/nextjs.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/jquery.svg" width={"100%"} className='img-fluid' alt="" />
                                    </div>

                                </div>
                            </div>
                            <div className="card-skills" style={{'--i': 2}}>
                                <div className="col-12 d-flex justify-content-center">
                                    <h4>Linguagens</h4>
                                </div>
                                <div className="col-12 d-flex justify-content-center align-items-center" style={{height: '160px'}}>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/js.png" width={"100%"} className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/typescript.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/c-sharp.png" width={"100%"} className='img-fluid' alt="" />
                                    </div>
                                </div>
                            </div>
                            <div className="card-skills" style={{'--i': 3}}>
                                <div className="col-12 d-flex justify-content-center">
                                    <h4>Back-end</h4>
                                </div>
                                <div className="col-12 d-flex justify-content-center" style={{marginTop: "20px"}}>
                                    <div className="col-3 pt-2 mx-3">
                                        <img src="/icones/jwt.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/mysql.png" className='img-fluid' alt="" />
                                    </div>
                                    <div className="col-3 pt-2 mx-3">
                                        <img src="/icones/node.png" width={"100%"} className='img-fluid' alt="" />
                                    </div>

                                </div>
                                <div className="col-12 d-flex justify-content-start m-0" style={{marginTop: "20px"}}>
                                    <div className="col-2 pt-2 mx-3">
                                        <img src="/icones/docker.png" width={"100%"} className='img-fluid' alt="" />
                                    </div>
                                </div>
                            </div>
                       </div>
                    </div>
                </div>
            </div>
        </>
    );
}