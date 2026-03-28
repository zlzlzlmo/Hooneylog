import { keyframes } from 'styled-components';

export const moveTagName = keyframes`
    40% {
        transform: rotate(-5deg);
    }

    60% {
        transform: rotate(5deg);
    }

    65% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(0);
    }
`;

export const showArticle = keyframes`
        from {
        opacity: 0;
        transform: translateY(20vh);
        visibility: hidden;
        transition: opacity 0.3s ease-out, transform 0.6s ease-out;
        will-change: opacity, visibility;
    }

    to {
        opacity: 1;
        transform: none;
        visibility: visible;
    }
`;
