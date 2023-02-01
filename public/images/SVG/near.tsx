import { useState, useEffect } from 'react';

const SvgComponent = (props) => {
  const [mode, setMode] = useState('#000');

  return (
    <svg
      width={19}
      height={18}
      fill="none"
      onMouseEnter={() => {
        setMode('#fff');
      }}
      onMouseLeave={() => {
        setMode('#000');
      }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#a)" fill={props.hardCodeMode ? props.hardCodeMode : mode}>
        <path
          d="M14.4384 0.914036L10.6769 6.50002C10.6159 6.58065 10.5877 6.68138 10.598 6.78195C10.6083 6.88253 10.6562 6.97548 10.7322 7.04213C10.8081 7.10877 10.9065 7.14416 11.0075 7.14117C11.1085
         7.13818 11.2046 7.09704 11.2765 7.02602L14.978 3.82603C14.9994 3.80645 15.026 3.79356 15.0546 3.78897C15.0832 3.78439 15.1125 3.7883 15.1389 3.80023C15.1652 3.81215 15.1876 3.83157 15.203 3.85606C15.2185
          3.88056 15.2264 3.90906 15.2258 3.93803V13.996C15.2255 14.0265 15.2159 14.0563 15.1983 14.0812C15.1807 14.1061 15.1559 14.1251 15.1272 14.1355C15.0985 14.1459 15.0673 14.1474 15.0378 14.1396C15.0083
           14.1318 14.9819 14.1152 14.962 14.092L3.76949 0.692036C3.59081 0.476912 3.36726 0.303501 3.11453 0.183961C2.8618 0.0644216 2.586 0.0016468 2.30646 3.75424e-05H1.91672C1.40838 3.75424e-05 0.92085
            0.202111 0.561395 0.561805C0.20194 0.921499 0 1.40935 0 1.91803V16.082C0 16.5907 0.20194 17.0785 0.561395 17.4382C0.92085 17.7979 1.40838 18 1.91672 18C2.24427 18 2.56634 17.9159 2.8522 17.7559C3.13806
             17.5959 3.37818 17.3653 3.54963 17.086L7.31113 11.5C7.37208 11.4194 7.40026 11.3187 7.39 11.2181C7.37975 11.1175 7.33181 11.0246 7.25585 10.9579C7.17988 10.8913 7.08151 10.8559 6.98052 10.8589C6.87954
              10.8619 6.78343 10.903 6.71153 10.974L3.00999 14.174C2.98865 14.1936 2.96204 14.2065 2.93344 14.2111C2.90485 14.2156 2.87555 14.2117 2.84916 14.1998C2.82277 14.1879 2.80046 14.1685 2.78499 14.144C2.76953
               14.1195 2.76159 14.091 2.76216 14.062V4.01403C2.76246 3.98349 2.77207 3.95377 2.7897 3.92885C2.80733 3.90392 2.83214 3.88498 2.86082 3.87454C2.8895 3.8641 2.92068 3.86268 2.9502 3.87045C2.97971 3.87822
                3.00615 3.89482 3.02598 3.91803L14.2185 17.318C14.3986 17.5312 14.6229 17.7025 14.876 17.8199C15.129 17.9374 15.4046 17.9982 15.6835 17.998H16.0833C16.335 17.998 16.5842 17.9484 16.8168 17.852C17.0493 
                17.7556 17.2606 17.6143 17.4386 17.4362C17.6166 17.2581 17.7578 17.0467 17.8541 16.814C17.9504 16.5813 18 16.3319 18 16.08V1.91803C18 1.66515 17.95 1.41475 17.853 1.18127C17.7559 0.947778 17.6136 0.735805
                 17.4344 0.557545C17.2551 0.379285 17.0424 0.238258 16.8085 0.142578C16.5745 0.0468983 16.324 -0.00154465 16.0713 3.75424e-05C15.7437 7.6864e-05 15.4217 0.0841096 15.1358 0.244117C14.8499 0.404124 14.6098
                  0.634766 14.4384 0.914036Z"
          fill="#black"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h19v17H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SvgComponent;