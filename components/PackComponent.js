import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image'


const TokenComponent = (props) =>{
    const {type, children} = props;
    // const [reveal, revealMe] = useState(false);
    const tokenType = "/../public/images/packimages/"+type+".png"

    return (
        <div className="w-64 h-72 overflow-hidden ease-in-out">
                <Image
                    src={tokenType}
                    width={300}
                    height={250}
                />

                <div className="text-center">
                    <div>
                        PREMIUM PACK
                    </div>
                    
                    <div className="font-thin">
                        Release 3
                    </div>
                </div>
        </div>
    )
}

TokenComponent.propTypes = {
    type: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

export default TokenComponent;