export const Kerrigan = true;

export const options = [
    { key: 0, value: "tab1", label: "首页" },
    { key: 2, value: "tab3", label: "周边" },
];

export const optionSuper = [
    { key: 0, value: "tab1", label: "首页" },
    { key: 1, value: "tab2", label: "服务" },
    { key: 2, value: "tab3", label: "周边" },
    { key: 3, value: "service1", label: "服务1" },
    { key: 4, value: "service2", label: "服务2" },
];

export function filterOption(value) {
    const f = optionSuper.find((item) => item.value === value);

    return f == null ? value : f.label;
}

//todo 联系人view 里写死了 clientid = "36ff662f-3041-5c10-8bde-65e6fb86523b"
//http://106.12.147.150:8080/redoc#operation/__token_user_auth_token_post