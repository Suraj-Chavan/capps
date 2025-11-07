const BACK_TO_TOP_BUTTON_STYLE = "position: fixed; bottom: 35px; right: 16px; border: none; outline: none; background-color: #0b2673de; color: white; cursor: pointer; border-radius: 4px; font-size: medium; width: 35px; height: 35px;";

const isFunction = (fn) => ({}).toString.call(fn) === "[object Function]";
const hasOwn = (obj, key) => ({}).hasOwnProperty.call(obj, key);
const randomId = () => `${Date.now()}-${Math.round(Math.random() * 100000000)}`;
const removeButton = (tpl) => (tpl && tpl.parentNode) && tpl.parentNode.removeChild(tpl);


function createHtmlElement(clickHandler) {
    // wrapper
    let button = document.createElement('button');
    button.addEventListener('click', clickHandler, false);
    button.setAttribute('id', `back-to-top-${randomId()}`);
    button.setAttribute('class', `back-to-top`);
    button.setAttribute('title', `Back To top`);
    // make icon
    let $arrow = document.createElement('i');
    $arrow.setAttribute('class', 'fa fa-arrow-up');
    button.appendChild($arrow);
    button.setAttribute("style", BACK_TO_TOP_BUTTON_STYLE);
    return button;
}


// Directive
export const scroll = {
    $tpl: {},
    bind: function (el, binding) {
        const duration = 300,
            fn = (isFunction(binding.value) && binding.value) || (() => { }),
            IF_LOADING_FLAG_IS_MISSING = !hasOwn(fn, "isLoading");

        function animateScroll(duration, top, clientHeight) {
            let start = top
            let end = clientHeight
            let change = end - start
            let increment = 20

            function easeInOut(currentTime, start, change, duration) {
                currentTime /= duration / 2
                if (currentTime < 1) {
                    return change / 2 * currentTime * currentTime + start
                }
                currentTime -= 1
                return -change / 2 * (currentTime * (currentTime - 2) - 1) + start
            }

            function animate(elapsedTime) {
                elapsedTime += increment
                var position = easeInOut(elapsedTime, start, change, duration)
                el.scrollTop = position

                if (elapsedTime < duration) {
                    setTimeout(function () {
                        animate(elapsedTime)
                    }, increment)
                }
            }

            animate(0)
        }
        function scrollToTop(top, clientHeight) {
            animateScroll(duration, top, clientHeight)
        }
        const clickHandler = () => {
            scrollToTop(0, 0)
        };
        const endOfPage = function () {
            const bottomOfWindow = el.scrollTop + el.clientHeight >= el.scrollHeight;
            if (bottomOfWindow)
                return true;
            return false;
        };
        const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => scrollHeight > clientHeight || scrollWidth > clientWidth;

        scroll.$tpl = createHtmlElement(clickHandler);
        (function () {
            var throttle = function (type, name, obj) {
                obj = obj || window;
                var running = false;

                obj.func = function () {
                    if (running) return;
                    running = true;
                    requestAnimationFrame(function () {
                        obj.dispatchEvent(new CustomEvent(name));
                        running = false;
                    });
                };

                obj.addEventListener(type, obj.func);

                // if (!isOverflown(obj))
                //     obj.dispatchEvent(new Event('scroll'));
            };
            /* init - you can init any event */
            throttle("scroll", "optimizedScroll", el);
        })();

        const f = function (evt) {
            (endOfPage() && !fn.isLoading) && fn(evt, el);
            if (el.scrollTop >= 30)
                !(scroll.$tpl && scroll.$tpl.parentNode) && document.querySelector('body').appendChild(scroll.$tpl);
            else removeButton(scroll.$tpl);
        };
        el.removeEventListener('optimizedScroll', f);
        el.addEventListener('optimizedScroll', f);

        IF_LOADING_FLAG_IS_MISSING && el.removeEventListener('scroll', el.func);
    },
    unbind(el) {
        el.removeEventListener('scroll', el.func);
        removeButton(scroll.$tpl);
        scroll.$tpl = {};
    }
}

