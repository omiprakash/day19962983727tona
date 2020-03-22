import React from 'react';
import { createWorker } from 'tesseract.js';

import './index.scss';

class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            children: [],
            activeItemIndex: 0,
        }
        this.images = [];
        this.counter = 1;
        this.translatedR = 0;
    }

    componentDidMount = () => {
        fetch("https://74k4rzrsqubz5ma3f-mock.stoplight-proxy.io/api/v1/images/list")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    }, () => {this.imageDetail(null, 0);});
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
        
    }

    imageDetail = (e, id) => {
        this.setState({
            imageDetails: '',
            convertedText: ''
        })
        fetch("https://74k4rzrsqubz5ma3f-mock.stoplight-proxy.io/api/v1/images?id=" + id)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        imageDetails: result
                    });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    getImgText = (e, img) => {
        const worker = createWorker({
            logger: m => console.log(m)
        });
        (async () => {
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(img);
            this.setState({
                convertedText: text
            })
            await worker.terminate();
        })();
    }

    carouselControl = (e, angle) => {
        let offsetWidth = document.getElementsByClassName('imgItem')[0].offsetWidth + 15;
        let length = this.state.items.length;
        if(angle === 'right' && this.counter <=length-3){
            this.translatedR = this.translatedR + -offsetWidth;
            document.getElementById('imgSld').style.transform = "translateX("+this.translatedR+"px)";
            this.counter = this.counter + 1;
        } 
        if(angle === 'left' && this.counter > 1){
            this.translatedR = this.translatedR + offsetWidth;
            document.getElementById('imgSld').style.transform = "translateX("+this.translatedR+"px)";
            this.counter = this.counter - 1;
        }
    }

  

    render() {
        const { imageDetails } = this.state;
        return (
            <div className="imageGallery">
                <h3><span>Images</span></h3>
               {(this.state.items && this.state.items.length > 0) && 
                <div className="imagesSlider">
                    <div id="imgSld" className="imgSlider">
                        {this.state.items && this.state.items.map((data, index) => {
                            return (
                                <div key={index} id={index+"imgDiv"} className="imgItem">
                                    <img alt={data.id} src={data.url} onClick={e => { this.imageDetail(e, data.id) }}/>
                                </div>
                            )
                        }
                        )}
                    </div>
                    <div id="leftBtn" className="buttonLeft btnBuutton" onClick={e => this.carouselControl(e, 'left')}> <span> &#8592; </span> </div>
                    <div id="rightBtn" className="buttonRight btnBuutton" onClick={e => this.carouselControl(e, 'right')}> <span> &#8594; </span> </div>
                </div>}
                {imageDetails && <React.Fragment><h3><span>Details</span></h3>
                    <div className="detailsBox">
                        <div className="imgDetails">
                            <div className="img">
                                <img className="imgDetailBox" alt={imageDetails.id} src={imageDetails.url} />
                            </div>
                            <div className="imgText">
                                <h4>{imageDetails.title}</h4>
                                <span>Quantitly: <b>{imageDetails.quantity}</b></span>
                                <div className="text">
                                    <span>Description: </span>{imageDetails.description}
                                </div>
                            </div>
                        </div>
                        <div className="numberBox">
                            <span>Features:</span>
                            <ul>
                                {imageDetails.features.map((data, index) => {
                                    return (
                                        <li key={index}>{data}</li>
                                    )
                                })}
                            </ul>
                            <div className="buttonbox">
                                <button onClick={e => { this.getImgText(e, imageDetails.url) }}>SCAN NOW</button>
                            </div>
                        </div>
                    </div>
                    {this.state.convertedText && <div className="numberScan">{this.state.convertedText}</div>}
                </React.Fragment>}
            </div>
                
        );
    }
}

export default Gallery;