function calculate_kernal(sigma) {
    // x - left to right
    // y - top to bottom
    let kernal = [];
    let idk_man = 2;
    let fac_1 = 1 / (2 * Math.PI * Math.pow(sigma, 2));

    for (let y = -2; y < 3; y++) {
        kernal.push([]);
        for (let x = -2; x < 3; x++) {
            let fac_2 =
                -(Math.pow(x, 2) + Math.pow(y, 2)) / (2 * Math.pow(sigma, 2));
            let k = fac_1 * Math.exp(fac_2);
            kernal[idk_man + y].push(k);
        }
    }
    return kernal;
}

calculate_kernal(sigma_one);
