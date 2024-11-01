//
export const getCorrectOrientation = () => {
    let orientationType: string = screen.orientation.type;
    if (!window.matchMedia("((display-mode: fullscreen) or (display-mode: standalone) or (display-mode: window-controls-overlay))").matches) {
        if (matchMedia("(orientation: portrait)").matches) {orientationType = orientationType.replace("landscape", "portrait");} else
            if (matchMedia("(orientation: landscape)").matches) {orientationType = orientationType.replace("portrait", "landscape");};
    }
    return orientationType;
};

//
export const isMobile = () => {
    const regex =
        /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
};

//
export interface GridItemType {
    cell: [number, number];
    id: string;
    label: string;
    pointerId: number;
    icon: string;
    href?: string;
    action?: string;
    detached?: boolean;
};

//
export interface GridPageType {
    id: string;
    list: string[];
    layout: [number, number];
    size: [number, number];
};

//
export interface GridArgsType {
    item: GridItemType;
    items: Map<string, GridItemType>;
    page: GridPageType;
};

//
export interface GridsStateType {
    grids: Map<string, GridPageType>;
    items: Map<string, GridItemType>;
    lists: Map<string, Set<string>>;
};


//
export const getParent = (e) => {
    const parent = e.parentNode || e.parentElement || e?.getRootNode?.()?.host;
    return parent.shadowRoot && e.slot != null
        ? parent.shadowRoot.querySelector(
            e.slot ? `slot[name=\"${e.slot}\"]` : `slot:not([name])`
        ).parentNode
        : parent;
};

//
const get = (items, id)=>{
    if (typeof items?.get == "function") {
        return items.get(id);
    } else {
        return Array.from(items)?.find?.((item: any)=>(item.id == id));
    }
}

//
export const redirectCell = ($preCell: [number, number], gridArgs: GridArgsType): [number, number] => {
    //const items = gridItems;
    const preCell: [number, number] = [...$preCell]; // make non-conflict copy
    const icons =
        [...gridArgs.page.list]?.map((id) => get(gridArgs.items, id)).filter((m) => !!m) || [];

    //
    const checkBusy = (cell): boolean => {
        return icons
            .filter((e) => (!(e == gridArgs.item || e.id == gridArgs.item.id) && (e.pointerId < 0 || e.pointerId == null)))
            .some((one) => {
                return (one?.cell?.[0]||0) == (cell[0]||0) && (one?.cell?.[1]||0) == (cell[1]||0);
            });
    };

    //
    if (!checkBusy(preCell)) {
        gridArgs.item.cell = [...preCell];//makeReactive([...preCell]);
        return gridArgs.item.cell;
    }

    //
    const orientation = getCorrectOrientation();
    const layout = [...gridArgs.page.layout];
    if (orientation.startsWith("landscape")) {
        //layout.reverse();
    }

    //
    const columns = layout[0] || 4;
    const rows = layout[1] || 8;

    //
    const variants: [number, number][] = [
        [preCell[0] + 1, preCell[1]] as [number, number],
        [preCell[0] - 1, preCell[1]] as [number, number],
        [preCell[0], preCell[1] + 1] as [number, number],
        [preCell[0], preCell[1] - 1] as [number, number],
    ].filter((v) => {
        return v[0] >= 0 && v[0] < columns && v[1] >= 0 && v[1] < rows;
    }) || [];

    //
    const suitable = variants.find((v) => !checkBusy(v));
    if (suitable) {
        gridArgs.item.cell = [...suitable];//makeReactive([...suitable]);
        return gridArgs.item.cell;
    }

    //
    let exceed = 0;
    let busy = true;
    let comp = [...preCell];
    while (busy && exceed++ < columns * rows) {
        //
        if (!(busy = checkBusy(comp))) {
            gridArgs.item.cell = [...comp] as [number, number];//makeReactive([...comp]);
            return gridArgs.item.cell;
        }

        //
        comp[0]++;
        if (comp[0] >= columns) {
            comp[0] = 0; comp[1]++;
            if (comp[1] >= rows) { comp[1] = 0; }
        }
    }

    //
    gridArgs.item.cell = [...preCell];//makeReactive([...preCell]);
    return gridArgs.item.cell;
};




/*
 * NEXT GENERATION!
 */

//
const orientationNumberMap = {
    "portrait-primary": 0,
    "landscape-primary": 1,
    "portrait-secondary": 2,
    "landscape-secondary": 3
}

//
const roundNearest = (number, N = 1)=>(Math.round(number * N) / N)

//
export const convertPointerPxToOrientPx = ($pointerPx: [number, number], gridArgs: GridArgsType): [number, number] => {
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const pointerPx: [number, number] = [...$pointerPx];
    const orientIndex = orientationNumberMap[orientation] || 0;

    //
    if (orientIndex%2) { boxInPx.reverse(); pointerPx.reverse(); }
    return [
        ((orientIndex==0 || orientIndex==3) ? pointerPx[0] : boxInPx[0] - pointerPx[0]) || 0,
        ((orientIndex==0 || orientIndex==1) ? pointerPx[1] : boxInPx[1] - pointerPx[1]) || 0
    ];
}

//
export const convertOrientPxToPointerPx = ($orientPx: [number, number], gridArgs: GridArgsType): [number, number] => {
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientPx: [number, number] = [...$orientPx];
    const orientIndex = orientationNumberMap[orientation] || 0;

    //
    if (orientIndex%2) { boxInPx.reverse(); }
    const pointerPx: [number, number] = [
        ((orientIndex==0 || orientIndex==3) ? orientPx[0] : boxInPx[0] - orientPx[0]) || 0,
        ((orientIndex==0 || orientIndex==1) ? orientPx[1] : boxInPx[1] - orientPx[1]) || 0
    ];
    if (orientIndex%2) { pointerPx.reverse(); }
    return pointerPx;
}

//
export const convertOrientPxToCX = ($orientPx: [number, number], gridArgs: GridArgsType): [number, number] => {
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientPx: [number, number] = [...$orientPx];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridPxToCX = [layout[0] / boxInPx[0], layout[1] / boxInPx[1]];
    return [orientPx[0] * gridPxToCX[0], orientPx[1] * gridPxToCX[1]]
}

//
export const relativeToAbsoluteInPx = ($relativePx: [number, number], gridArgs: GridArgsType): [number, number] => {
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridCXToPx = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    const $orientPxBasis: [number, number] = [
        gridArgs.item.cell[0] * gridCXToPx[0],
        gridArgs.item.cell[1] * gridCXToPx[1]
    ];
    const pointerPxBasis = convertOrientPxToPointerPx($orientPxBasis, gridArgs);
    return [pointerPxBasis[0] + $relativePx[0], pointerPxBasis[1] + $relativePx[1]];
}

//
export const absoluteCXToRelativeCX = ($CX: [number, number], gridArgs: GridArgsType): [number, number] =>{
    const $orientPxBasis = [gridArgs.item.cell[0], gridArgs.item.cell[1]];
    return [$CX[0] - $orientPxBasis[0], $CX[1] - $orientPxBasis[1]];
}

//
export const absolutePxToRelativeInOrientPx = ($absolutePx: [number, number], gridArgs: GridArgsType)=>{
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const gridCXToPx = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    const $orientPxBasis = [gridArgs.item.cell[0] * gridCXToPx[0], gridArgs.item.cell[1] * gridCXToPx[1]];
    const orientPx = convertPointerPxToOrientPx($absolutePx, gridArgs);
    return [orientPx[0] - $orientPxBasis[0], orientPx[1] - $orientPxBasis[1]];
}

// should be relative from grid-box (not absolute or fixed position)
export const floorInOrientPx = ($orientPx: [number, number], gridArgs: GridArgsType) => {
    const orientPx: [number, number] = [...$orientPx];
    const orientation = getCorrectOrientation();
    const boxInPx = [...gridArgs.page.size];
    const orientIndex = orientationNumberMap[orientation] || 0;
    const layout = [...gridArgs.page.layout];
    if (orientIndex%2) { boxInPx.reverse(); };

    //
    const inBox = [boxInPx[0] / layout[0], boxInPx[1] / layout[1]];
    return [roundNearest(orientPx[0], inBox[0]), roundNearest(orientPx[1], inBox[1])];
};

//
export const floorInCX = ($CX: [number, number], gridArgs: GridArgsType): [number, number] => {
    const layout = gridArgs.page.layout;
    return [
        Math.min(Math.max(roundNearest($CX[0]), 0), layout[0]-1),
        Math.min(Math.max(roundNearest($CX[1]), 0), layout[1]-1)
    ];
};
