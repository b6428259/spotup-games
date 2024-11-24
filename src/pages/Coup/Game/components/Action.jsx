


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