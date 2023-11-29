import React, {SVGProps} from "react";

export const Marker: React.FC<SVGProps<SVGElement>> = ({color}) => {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.796875 10.9656C0.796875 5.18628 5.35779 0.474609 11.0166 0.474609C16.6754 0.474609 21.2363 5.18628 21.2363 10.9656C21.2363 13.7555 20.4491 16.7519 19.0569 19.3402C17.667 21.9249 15.6371 24.171 13.0956 25.3707C12.4448 25.6783 11.7351 25.8377 11.0166 25.8377C10.2981 25.8377 9.58839 25.6783 8.93762 25.3707C6.39612 24.171 4.36619 21.926 2.9763 19.3402C1.58409 16.7519 0.796875 13.7555 0.796875 10.9656ZM11.0166 2.24414C6.35407 2.24414 2.54883 6.13357 2.54883 10.9656C2.54883 13.4394 3.25311 16.1468 4.51569 18.4955C5.77943 20.8466 7.56642 22.7707 9.67811 23.7675C10.0968 23.9657 10.5536 24.0684 11.016 24.0684C11.4784 24.0684 11.9352 23.9657 12.3539 23.7675C14.4668 22.7707 16.2538 20.8466 17.5175 18.4955C18.7801 16.1479 19.4844 13.4394 19.4844 10.9656C19.4844 6.13357 15.6791 2.24414 11.0166 2.24414ZM11.0166 8.14258C10.6715 8.14258 10.3298 8.21123 10.0109 8.34462C9.6921 8.47802 9.4024 8.67353 9.15837 8.92C8.91435 9.16648 8.72078 9.45908 8.58871 9.78112C8.45665 10.1032 8.38867 10.4483 8.38867 10.7969C8.38867 11.1454 8.45665 11.4906 8.58871 11.8126C8.72078 12.1347 8.91435 12.4273 9.15837 12.6737C9.4024 12.9202 9.6921 13.1157 10.0109 13.2491C10.3298 13.3825 10.6715 13.4512 11.0166 13.4512C11.7136 13.4512 12.382 13.1715 12.8748 12.6737C13.3677 12.176 13.6445 11.5008 13.6445 10.7969C13.6445 10.0929 13.3677 9.41778 12.8748 8.92C12.382 8.42223 11.7136 8.14258 11.0166 8.14258ZM6.63672 10.7969C6.63672 9.6236 7.09817 8.49838 7.91956 7.66876C8.74094 6.83913 9.85498 6.37305 11.0166 6.37305C12.1782 6.37305 13.2923 6.83913 14.1136 7.66876C14.935 8.49838 15.3965 9.6236 15.3965 10.7969C15.3965 11.9701 14.935 13.0954 14.1136 13.925C13.2923 14.7546 12.1782 15.2207 11.0166 15.2207C9.85498 15.2207 8.74094 14.7546 7.91956 13.925C7.09817 13.0954 6.63672 11.9701 6.63672 10.7969Z" fill={color || "#DBFF00"} />
    </svg>
  );
};
