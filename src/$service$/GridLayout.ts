import { getCorrectOrientation } from "../$core$/GridItemUtils";
import { setStyleRules, type StyleTuple } from "./StyleRules";

//
export const whenAnyScreenChanges = (cb)=>{
    //
    if ("virtualKeyboard" in navigator) {
        // @ts-ignore
        navigator?.virtualKeyboard?.addEventListener?.(
            "geometrychange",
            cb,
            {passive: true}
        );
    }

    //
    document.documentElement.addEventListener("DOMContentLoaded", cb, {
        passive: true,
    });
    screen.orientation.addEventListener("change", cb, {passive: true});
    matchMedia("(orientation: portrait)").addEventListener("change", cb, {passive: true});
    self.addEventListener("resize", cb, {passive: true});

    //
    window?.visualViewport?.addEventListener?.("scroll", cb);
    window?.visualViewport?.addEventListener?.("resize", cb);

    //
    document.documentElement.addEventListener("fullscreenchange", cb);

    //
    requestAnimationFrame(cb);
}

//
CSS?.registerProperty?.({
    name: "--translate-x",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
CSS?.registerProperty?.({
    name: "--translate-y",
    syntax: "<length-percentage>",
    inherits: true,
    initialValue: "0px",
});

//
export const getOrientedPoint = () => {
    const orientation = getCorrectOrientation();
    switch (orientation) {
        case "portrait-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * 1px)`,
            };

        case "portrait-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * -1px)`,
            };

        case "landscape-primary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--dir-y)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--dir-x)) * -1px)`,
            };

        case "landscape-secondary":
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-row)) * var(--dir-y)) * -1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-col)) * var(--dir-x)) * 1px)`,
            };

        default:
            return {
                "--translate-x": `calc(calc(calc(var(--grid-w) / var(--f-col)) * var(--dir-x)) * 1px)`,
                "--translate-y": `calc(calc(calc(var(--grid-h) / var(--f-row)) * var(--dir-y)) * 1px)`,
            };
    }
};

//
export const animationSequence = () => {
    return [
        {
            "--grid-c": "var(--fp-cell-x)",//"calc(var(--fp-cell-x) + var(--c-shift-mod))",
            "--grid-r": "var(--fp-cell-y)",//"calc(var(--fp-cell-y) + var(--r-shift-mod))"
        },
        {
            "--drag-x": 0,
            "--drag-y": 0,
            "--grid-c": "var(--fc-cell-x)",//"round(nearest, calc(var(--fc-cell-x) + var(--c-shift-mod)), 1)",
            "--grid-r": "var(--fc-cell-y)"//"round(nearest, calc(var(--fc-cell-y) + var(--r-shift-mod)), 1)",
        }
    ];
};

//
const realCellOriented = {
    "portrait-primary": {
        "grid-column": "var(--grid-column)",
        "grid-row": "var(--grid-row)",
    },
    "landscape-primary": {
        "grid-column": "var(--grid-row)",
        "grid-row": "calc(var(--layout-c) - var(--grid-column) + 1)",
    },
    "portrait-secondary": {
        "grid-column": "calc(var(--layout-c) - var(--grid-column) + 1)",
        "grid-row": "calc(var(--layout-r) - var(--grid-row) + 1)",
    },
    "landscape-secondary": {
        "grid-column": "calc(var(--rows) - var(--grid-row) + 1)",
        "grid-row": "var(--grid-column)",
    }
};

//
const currentCellLayout = {...realCellOriented[getCorrectOrientation()]};

//
export const updateOrientation = (_) => {
    Object.assign(currentCellLayout, realCellOriented[getCorrectOrientation()]);
};

//
const classes: StyleTuple[] = [
    [":where(.u2-grid-item), :where(.u2-grid-page > *), :where(.u2-grid-item-label)", currentCellLayout]
];

//
const initialize = ()=>{
    whenAnyScreenChanges((e?: any) => {
        updateOrientation(e);
        setStyleRules(classes);
    });
}

//
export default initialize;
