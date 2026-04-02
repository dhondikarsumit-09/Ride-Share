const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayLoader = null;

export function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout is only available in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Razorpay), { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay Checkout.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SRC;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
      document.body.appendChild(script);
    });
  }

  return razorpayLoader;
}
