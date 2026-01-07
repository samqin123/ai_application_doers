const HONGLOUMENG_DATA = {
  characters: [
    {
      id: 'jia_baoyu',
      name: '贾宝玉',
      alias: ["\u5b9d\u7389", "\u5b9d\u4e8c\u7237", "\u8854\u7389\u800c\u751f"],
      importance: 10,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾府长房长孙，衔玉而诞。聪颖至极，却行为乖张。与林黛玉情深意长，最终幻灭出家。`
    },
    {
      id: 'lin_daiyu',
      name: '林黛玉',
      alias: ["\u6797\u59b9\u59b9", "\u98a6\u513f", "\u6f47\u6e58\u5983\u5b50"],
      importance: 10,
      family: '林家',
      color: '#c77dff',
      introduction: `金陵十二钗之首，林如海之女，贾母外孙女。生性聪慧，容貌秀丽，气质出尘。与贾宝玉深情相恋，最终泪尽人亡。`
    },
    {
      id: 'xue_baochai',
      name: '薛宝钗',
      alias: ["\u5b9d\u9497", "\u5b9d\u59d0\u59d0", "\u8605\u829c\u541b"],
      importance: 10,
      family: '薛家',
      color: '#c77dff',
      introduction: `金陵十二钗之一，薛家独女。容貌秀丽，举止端庄，博学多才。后与贾宝玉成婚，但宝玉最终弃她出家。`
    },
    {
      id: 'wang_xifeng',
      name: '王熙凤',
      alias: ["\u51e4\u59d0", "\u7199\u51e4", "\u51e4\u8fa3\u5b50"],
      importance: 9,
      family: '贾府',
      color: '#9d4edd',
      introduction: `金陵十二钗之一，贾琏之妻。手段高明，聪慧过人，却心狠手辣。生育了巧姐。最终因过度操劳而病亡。`
    },
    {
      id: 'jia_mumother',
      name: '贾母',
      alias: ["\u8001\u592a\u592a", "\u8d3e\u6bcd\u8001\u592a\u592a"],
      importance: 10,
      family: '贾府',
      color: '#7209b7',
      introduction: `荣国府女主人，贾代善之妻。温柔慈祥，聪慧持家。宝玉和黛玉的至爱。一直掌控贾府大权。`
    },
    {
      id: 'jia_zheng',
      name: '贾政',
      alias: ["\u653f\u8001\u7239", "\u8d3e\u653f\u8001\u7237"],
      importance: 9,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾府现任主人，贾赦之弟。性格严肃，信奉理学。与宝玉关系紧张，多次鞭打宝玉。`
    },
    {
      id: 'wang_furen',
      name: '王夫人',
      alias: ["\u738b\u592b\u4eba", "\u592a\u592a"],
      importance: 8,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾政之妻，王熙凤之姑母。表面柔弱，实则专制。偏心长女元春，不待见林黛玉。`
    },
    {
      id: 'jia_yuanchun',
      name: '贾元春',
      alias: ["\u5143\u6625", "\u8d24\u5fb7\u5983"],
      importance: 8,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾政长女，贾宝玉之姐。入宫为妃，册封贤德妃。春节回家一次，贵不能言亲。最终薨于宫中。`
    },
    {
      id: 'jia_yingchun',
      name: '贾迎春',
      alias: ["\u8fce\u6625", "\u4e8c\u59d1\u5a18"],
      importance: 7,
      family: '贾府',
      color: '#9d4edd',
      introduction: `金陵十二钗之一，贾赦继室所生。性格温顺但无主见，被父亲以千两银子嫁给孙绍祖。最终被虐待致死。`
    },
    {
      id: 'jia_tanchun',
      name: '贾探春',
      alias: ["\u63a2\u6625", "\u4e09\u59d1\u5a18"],
      importance: 8,
      family: '贾府',
      color: '#9d4edd',
      introduction: `金陵十二钗之一，赵姨娘之女。聪慧干练，富有主见，管理大观园有方。最终被远嫁番邦。`
    },
    {
      id: 'jia_xichun',
      name: '贾惜春',
      alias: ["\u60dc\u6625", "\u56db\u59d1\u5a18"],
      importance: 7,
      family: '贾府',
      color: '#9d4edd',
      introduction: `金陵十二钗之一，贾珍继室所生。孤僻自守，不谙世事。最终遁入空门，成为尼姑。`
    },
    {
      id: 'qin_keqing',
      name: '秦可卿',
      alias: ["\u53ef\u537f", "\u79e6\u6c0f"],
      importance: 8,
      family: '宁府',
      color: '#7209b7',
      introduction: `金陵十二钗之一，贾珍之妻，秦业之女。容貌绝世，温柔体贴。与公公贾珍有不伦之情，最终自缢身亡。`
    },
    {
      id: 'shi_xiangyu',
      name: '史湘云',
      alias: ["\u6e58\u4e91", "\u6e58\u4e91\u59b9\u59b9"],
      importance: 8,
      family: '史家',
      color: '#c77dff',
      introduction: `金陵十二钗之一，史侯爵之女。性格豪爽坦率，待人真诚。与贾宝玉有缘无分。最后远嫁卫若兰。`
    },
    {
      id: 'li_ling',
      name: '李纹',
      alias: ["\u674e\u7eb9", "\u674e\u5927\u59d1\u5a18"],
      importance: 5,
      family: '李家',
      color: '#c77dff',
      introduction: `金陵十二钗副册人物，李家小姐。聪慧活泼，与李绡是好友。`
    },
    {
      id: 'li_xiao',
      name: '李绡',
      alias: ["\u674e\u7ee1", "\u674e\u4e8c\u59d1\u5a18"],
      importance: 5,
      family: '李家',
      color: '#c77dff',
      introduction: `金陵十二钗副册人物，李纹之妹。机灵聪慧，聪慧精明。`
    },
    {
      id: 'jia_lian',
      name: '贾琏',
      alias: ["\u740f\u4e8c\u7237", "\u740f\u54e5"],
      importance: 7,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾赦之子，王熙凤之夫。性格昏庸，好色成性，常被凤姐所制。多有风流债。`
    },
    {
      id: 'jia_zhen',
      name: '贾珍',
      alias: ["\u73cd\u5927\u7237", "\u73cd\u54e5"],
      importance: 7,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾敬之子，宁府主人。荒淫无度，与媳妇秦可卿有不伦之情。最终因好色纵欲而亡。`
    },
    {
      id: 'xue_auntie',
      name: '薛姨妈',
      alias: ["\u859b\u59e8\u5988", "\u859b\u5988\u5988"],
      importance: 6,
      family: '薛家',
      color: '#c77dff',
      introduction: `薛蟠、薛宝钗之母。性格慈祥但有些糊涂，非常宠爱儿子薛蟠。`
    },
    {
      id: 'xue_pan',
      name: '薛蟠',
      alias: ["\u87e0\u54e5", "\u859b\u5927\u54e5"],
      importance: 5,
      family: '薛家',
      color: '#c77dff',
      introduction: `薛家长子。纨绔子弟，蛮横好色。为非作歹，最后入了忏门。`
    },
    {
      id: 'miaoyu',
      name: '妙玉',
      alias: ["\u5999\u7389", "\u7384\u771f\u89c2\u5999\u7389"],
      importance: 7,
      family: '道观',
      color: '#9d4edd',
      introduction: `金陵十二钗之一。出身仕宦家庭，后削发为尼。性格孤傲清高，琴棋书画俱佳。最终遭强占。`
    },
    {
      id: 'jia_rui',
      name: '贾瑞',
      alias: ["\u745e\u5927\u7237"],
      importance: 4,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾代儒之孙。好色无耻，被王熙凤戏耍后自取其辱，最终病死。`
    },
    {
      id: 'jia_she',
      name: '贾赦',
      alias: ["\u5927\u8001\u7237", "\u8d66\u8001\u7237"],
      importance: 7,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾府长房长子，贾琏之父。专制任性，好色成性。与妾室有私生女，后来卖女儿为奴。`
    },
    {
      id: 'xin_furen',
      name: '邢夫人',
      alias: ["\u90a2\u592b\u4eba", "\u5927\u592a\u592a"],
      importance: 6,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾赦之妻，贾琏之母。性格刻薄无情，处处与王夫人不和。偏心自己的亲子。`
    },
    {
      id: 'zhao_auntie',
      name: '赵姨娘',
      alias: ["\u8d75\u59e8\u5a18", "\u8d75\u5988\u5988"],
      importance: 5,
      family: '贾府',
      color: '#9d4edd',
      introduction: `贾政之妾，贾探春之母。出身低微，尖刻尖酸。与王夫人矛盾不断。`
    },
    {
      id: 'jia_rong',
      name: '贾蓉',
      alias: ["\u84c9\u54e5", "\u84c9\u513f"],
      importance: 4,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾珍之子。性格柔弱，受父亲和妻子制约。与母亲秦可卿感情深厚。`
    },
    {
      id: 'xianglin_wife',
      name: '林黛玉妹妹',
      alias: ["\u9999\u83f1", "\u9999\u73b2"],
      importance: 6,
      family: '甄家',
      color: '#c77dff',
      introduction: `金陵十二钗副册人物。原是甄家小姐，被拐卖给薛蟠为妾。聪慧乖巧，善于作诗。`
    },
    {
      id: 'qingwen',
      name: '晴雯',
      alias: ["\u6674\u96ef", "\u6674\u59b9\u59b9"],
      importance: 5,
      family: '贾府',
      color: '#a0aec0',
      introduction: `贾宝玉的大丫鬟。活泼率直，对宝玉忠心耿耿。因故被逐，最终惨死。`
    },
    {
      id: 'xiren',
      name: '袭人',
      alias: ["\u88ad\u4eba", "\u82b1\u88ad\u4eba"],
      importance: 5,
      family: '贾府',
      color: '#a0aec0',
      introduction: `贾宝玉的二丫鬟。温柔贤惠，很会持家。为人八面玲珑，最后嫁给了蒋玉菡。`
    },
    {
      id: 'jia_jing',
      name: '贾敬',
      alias: ["\u8d3e\u656c", "\u656c\u8001\u7237"],
      importance: 4,
      family: '贾府',
      color: '#7209b7',
      introduction: `贾珍之父，宁府家族长老。沉迷道教炼丹，不理家事。最后因吃金丹而死。`
    },
  ],
  relations: [
    { from: 'jia_baoyu', to: 'lin_daiyu', type: 'love', weight: 0.95, description: '木石前盟，深情相恋' },
    { from: 'jia_baoyu', to: 'xue_baochai', type: 'love', weight: 0.65, description: '被动婚配，宝钗痴情' },
    { from: 'jia_baoyu', to: 'wang_xifeng', type: 'family', weight: 0.5, description: '亲戚关系，互有往来' },
    { from: 'jia_baoyu', to: 'jia_mumother', type: 'family', weight: 0.9, description: '祖孙关系，至爱至亲' },
    { from: 'jia_baoyu', to: 'jia_zheng', type: 'conflict', weight: 0.7, description: '父子冲突，理念对立' },
    { from: 'lin_daiyu', to: 'xue_baochai', type: 'conflict', weight: 0.6, description: '暗中对立，竞争宝玉' },
    { from: 'jia_yuanchun', to: 'jia_baoyu', type: 'family', weight: 0.6, description: '兄妹关系，互为牵挂' },
    { from: 'jia_yingchun', to: 'jia_tanchun', type: 'family', weight: 0.65, description: '姐妹关系，同病相怜' },
    { from: 'jia_tanchun', to: 'jia_xichun', type: 'family', weight: 0.7, description: '姐妹关系，互相支持' },
    { from: 'wang_xifeng', to: 'jia_lian', type: 'family', weight: 0.75, description: '夫妻关系，凤姐专断' },
    { from: 'jia_zhen', to: 'qin_keqing', type: 'conflict', weight: 0.85, description: '奸情关系，人伦悲剧' },
    { from: 'qin_keqing', to: 'wang_xifeng', type: 'neutral', weight: 0.4, description: '出嫁聘礼的往来' },
    { from: 'wang_xifeng', to: 'jia_yingchun', type: 'conflict', weight: 0.65, description: '拉郎配，迎春命悬一线' },
    { from: 'shi_xiangyu', to: 'jia_baoyu', type: 'neutral', weight: 0.55, description: '表亲关系，有缘无分' },
    { from: 'jia_zheng', to: 'wang_furen', type: 'family', weight: 0.6, description: '夫妻关系，举案齐眉' },
    { from: 'jia_mumother', to: 'wang_furen', type: 'family', weight: 0.7, description: '婆媳关系，相敬如宾' },
    { from: 'jia_mumother', to: 'lin_daiyu', type: 'family', weight: 0.85, description: '祖孙关系，相亲相爱' },
    { from: 'xue_auntie', to: 'wang_furen', type: 'family', weight: 0.65, description: '姐妹关系，互相扶持' },
    { from: 'xue_baochai', to: 'xue_auntie', type: 'family', weight: 0.8, description: '母女关系，孝顺听话' },
    { from: 'jia_lian', to: 'jia_she', type: 'family', weight: 0.5, description: '父子关系，受制于父' },
    { from: 'jia_she', to: 'xin_furen', type: 'family', weight: 0.5, description: '夫妻关系，互相制肘' },
    { from: 'jia_zhen', to: 'jia_rong', type: 'family', weight: 0.4, description: '父子关系，父爱缺失' },
    { from: 'qin_keqing', to: 'jia_rong', type: 'family', weight: 0.35, description: '夫妻关系，感情冷淡' },
    { from: 'jia_baoyu', to: 'qingwen', type: 'neutral', weight: 0.75, description: '主仆关系，相互信任' },
    { from: 'jia_baoyu', to: 'xiren', type: 'neutral', weight: 0.7, description: '主仆关系，体贴关怀' },
    { from: 'li_ling', to: 'li_xiao', type: 'family', weight: 0.8, description: '姐妹关系，亲密无间' },
    { from: 'xue_pan', to: 'xianglin_wife', type: 'family', weight: 0.45, description: '夫妇关系，悲欢离合' },
    { from: 'jia_zheng', to: 'jia_yuanchun', type: 'family', weight: 0.7, description: '父女关系，以女为荣' },
    { from: 'jia_zheng', to: 'jia_tanchun', type: 'family', weight: 0.65, description: '父女关系，赏识女儿' },
    { from: 'wang_furen', to: 'jia_yuanchun', type: 'family', weight: 0.75, description: '母女关系，以女为贵' },
    { from: 'jia_she', to: 'jia_yingchun', type: 'family', weight: 0.3, description: '父女关系，无情抛弃' },
    { from: 'jia_zheng', to: 'zhao_auntie', type: 'family', weight: 0.45, description: '主妾关系，权力关系' },
    { from: 'zhao_auntie', to: 'jia_tanchun', type: 'family', weight: 0.65, description: '母女关系，相互扶持' },
    { from: 'jia_mumother', to: 'jia_she', type: 'family', weight: 0.65, description: '母子关系，母爱偏心' },
    { from: 'jia_mumother', to: 'jia_zheng', type: 'family', weight: 0.75, description: '母子关系，恩爱有加' },
  ]
};
