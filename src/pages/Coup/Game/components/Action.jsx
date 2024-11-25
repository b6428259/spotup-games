


 const actions = [
    {
        name: 'Income',
        cost: 0,
        image: IncomeSkill,
        description: 'รับ 1 เหรียญ'
    },
    {
        name: 'Foreign Aid',
        cost: 0,
        image: ForeignAidSkill,
        description: 'รับ 2 เหรียญ (สามารถถูกขัดขวางโดย Duke)'
    },
    {
        name: 'Coup',
        cost: 7,
        image: CoupSkill,
        description: 'จ่าย 7 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ'
    },
    {
        name: 'Tax',
        cost: 0,
        character: 'Duke',
        image: DukeCard,
        description: 'อ้างว่ามี Duke เพื่อรับ 3 เหรียญ'
    },
    {
        name: 'Assassinate',
        cost: 3,
        character: 'Assassin',
        image: AssassinCard,
        description: 'จ่าย 3 เหรียญเพื่อบังคับให้ผู้เล่นอื่นเปิดไพ่ 1 ใบ'
    },
    {
        name: 'Exchange',
        cost: 0,
        character: 'Ambassador',
        image: AmbassadorCard,
        description: 'แลกไพ่กับกอง'
    },
    {
        name: 'Steal',
        cost: 0,
        character: 'Captain',
        image: CaptainCard,
        description: 'ขโมย 2 เหรียญจากผู้เล่นอื่น'
    }
];

switch (actionName) {
    case 'Income':
        updatedGameState.coins[playerName] += 1;
        logMessage = `${playerName} ใช้ Income (+1 เหรียญ)`;
        break;
    case 'Foreign Aid':
        updatedGameState.coins[playerName] += 2;
        logMessage = `${playerName} ใช้ Foreign Aid (+2 เหรียญ)`;
        break;
    case 'Tax':
        updatedGameState.coins[playerName] += 3;
        logMessage = `${playerName} ใช้ Tax (+3 เหรียญ)`;
        break;
    case 'Steal':
        // จะเพิ่มลอจิกการเลือกเป้าหมายในภายหลัง
        logMessage = `${playerName} พยายามขโมยเหรียญ`;
        break;
    case 'Assassinate':
        updatedGameState.coins[playerName] -= 3;
        logMessage = `${playerName} ใช้ Assassinate (-3 เหรียญ)`;
        break;
    case 'Coup':
        updatedGameState.coins[playerName] -= 7;
        logMessage = `${playerName} ใช้ Coup (-7 เหรียญ)`;
        break;
    case 'Exchange':
        logMessage = `${playerName} ใช้ Exchange`;
        break;
}
