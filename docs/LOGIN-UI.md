# Premium OurHostel authentication UI

The existing Next.js authentication screens now use the supplied navy, cream and gold reference. UI source: `src/common/layouts/AuthLayout.tsx`, `src/common/styles/auth.css`, `src/common/pages/auth/Login.tsx`. Existing Axios authentication calls, request fields, response handling, token storage, role destinations, password setup token handling, and unsupported social/recovery notices are retained.

## Actual assets

The requested public/images folder was empty. The supplied PNGs were inspected in src/assets and copied byte-for-byte:

| Public path | Original file | Use |
| --- | --- | --- |
| /images/image1.png | src/common/assets/login1.png | Campus background, cover and center |
| /images/image2.png | src/common/assets/login3.png | Supplied OurHostel branding |
| /images/image3.png | src/common/assets/login4.png | Gold leaves |
| /images/image4.png | src/common/assets/login5.png | Four feature icons, cropped with CSS from the supplied strip |
| /images/image6.png | src/common/assets/login 6.png | Cream/gold bottom wave |

No image5/provider asset was supplied. Existing individual Google/Microsoft SVG buttons are retained and explain that those authentication APIs are unavailable. The older backpack asset remains in src/assets but is not used by this design. No images were generated, downloaded or edited.

## Responsive behavior

Normal-flow Grid provides the header link, left branding, right card and bottom feature strip. Only noninteractive decorative images and input icons use absolute positioning. The card grows naturally for validation and API errors. Inputs remain 16px and primary controls at least 44px. No global overflow hiding or whole-page transform is used.

Tablet layouts retain two columns where practical, then center the card below 850px. Phones hide the decorative features and left branding. Short desktop viewports hide duplicate card branding while keeping the left logo, and simplify the feature footer to fit controls within the available height. High zoom or unusually short viewports can scroll to keep content accessible.

Remembered email restoration now runs after hydration, avoiding a mismatch between the server-rendered checkbox and the client's saved preference. Only email is remembered; authentication remains in sessionStorage.

## Verification

- Next production build and ESLint pass.
- 10 contract/production smoke tests pass, including all native role routes and HTTP PNG signature checks for every new public asset.
- 43 browser layout cases pass: desktop, tablet and mobile, including 1366x600, 1366x768, 1440x900, 1536x1024, 1920x1080 and 320px mobile.
- Zoom equivalents: 75%, 80%, 90%, 100%, 110%, 125%, 150%, 200%; effective CSS viewport and device pixel density are emulated. Native browser chrome zoom controls are not driven.
- Keyboard order/focus, required/email validation, show/hide password, loading, duplicate-submit protection, connection errors/retry, remember preference restoration/removal, setup link/raw token, unsupported social/recovery notices and unauthenticated role-route redirects pass.
- The loading/error test intercepts and fails the request; no test credentials are sent and no successful login is fabricated.
- Live unauthenticated API probes: login/setup empty bodies return 422; protected reads require authentication. Login CORS preflight returns 204 with allowed origin http://localhost:3000. Details: docs/api-verification.json.
- Successful live authentication requires valid account credentials and remains unverified.

Browser results and screenshots: artifacts/login-qa.json and artifacts/login-*.png.
