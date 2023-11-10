import { QtumProvider } from "./QtumProvider";
export declare class QtumFunctionProvider extends QtumProvider {
    readonly fn: Function;
    constructor(fn: Function);
    send(method: string, params: Array<any>): Promise<any>;
}
