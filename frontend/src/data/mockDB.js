export const DB = {
  modules:[
    {id:'m1',title:'Python Programming Fundamentals',subj:'Programming',grade:'10',price:1500,dur:'6h 20m',grad:'linear-gradient(160deg,#b9c0f7,#8b9af0)',gradClass:'gc-lav',inst:'Minuri A.'},
    {id:'m2',title:'Computer Networks & the Internet',subj:'Networking',grade:'11',price:1800,dur:'5h 10m',grad:'linear-gradient(160deg,#bdeede,#7dd3c0)',gradClass:'gc-mint',inst:'Minuri A.'},
    {id:'m3',title:'Database Concepts with SQL',subj:'Databases',grade:'11',price:1600,dur:'4h 45m',grad:'linear-gradient(160deg,#f9c6d8,#f4a6c0)',gradClass:'gc-rose',inst:'Minuri A.'},
    {id:'m4',title:'Digital Literacy & ICT Ethics',subj:'Literacy',grade:'10',price:1200,dur:'3h 30m',grad:'linear-gradient(160deg,#fbe0b8,#f5c98a)',gradClass:'gc-peach',inst:'Minuri A.'},
    {id:'m5',title:'Web Development Basics (HTML/CSS)',subj:'Web',grade:'10',price:1700,dur:'5h 50m',grad:'linear-gradient(135deg,#4f7cff,#3b6cf6)',gradClass:'gc-blue',inst:'Minuri A.'},
    {id:'m6',title:'Logic, Algorithms & Flowcharts',subj:'Programming',grade:'11',price:1400,dur:'4h 05m',grad:'linear-gradient(160deg,#b9c0f7,#8b9af0)',gradClass:'gc-lav',inst:'Minuri A.'},
  ],
  library:[
    {id:'m1',viewLimit:8,viewCount:3,progress:62},
    {id:'m4',viewLimit:8,viewCount:1,progress:100},
    {id:'m6',viewLimit:8,viewCount:5,progress:34},
  ],
  live:[
    {id:'l1',topic:'Live: Loops & Iteration in Python',when:'Today · 5:00 PM',grade:'10',status:'upcoming'},
    {id:'l2',topic:'Live: Subnetting Walkthrough',when:'Tomorrow · 4:30 PM',grade:'11',status:'upcoming'},
    {id:'l3',topic:'Live: SQL Joins Masterclass',when:'Sat · 10:00 AM',grade:'11',status:'upcoming'},
  ],
  quiz:{
    id:'q1',title:'Python Fundamentals — Quick Check',timer:'15:00',
    questions:[
      {q:'Which keyword defines a function in Python?',opts:['func','def','function','lambda'],ans:1,exp:'`def` introduces a function definition in Python.'},
      {q:'What is the output of: print(type([]))?',opts:["<class 'list'>","<class 'dict'>","<class 'tuple'>","<class 'set'>"],ans:0,exp:'[] creates a list, so its type is list.'},
      {q:'Which operator is used for exponentiation?',opts:['^','**','//','%'],ans:1,exp:'** raises a number to a power; ^ is bitwise XOR.'},
      {q:'How do you start a single-line comment?',opts:['//','/* */','#','--'],ans:2,exp:'Python uses # for single-line comments.'},
    ]
  },
  approvals:[
    {id:'o1',student:'Kasun Perera',grade:'10',module:'Python Programming Fundamentals',amount:1500,ip:'112.134.x.x'},
    {id:'o2',student:'Nethmi Silva',grade:'11',module:'Computer Networks & the Internet',amount:1800,ip:'175.157.x.x'},
    {id:'o3',student:'Dilan Fernando',grade:'9',module:'Database Concepts with SQL',amount:1600,ip:'124.43.x.x',flag:'Grade mismatch'},
  ],
  users:[
    {name:'Kasun Perera',email:'kasun@example.lk',grade:'10',role:'Student',status:'Active'},
    {name:'Nethmi Silva',email:'nethmi@example.lk',grade:'11',role:'Student',status:'Active'},
    {name:'Amaya Jay',email:'amaya@example.lk',grade:'10',role:'Student',status:'Locked'},
    {name:'Minuri Alaharuwan',email:'minuri@ictacademy.lk',grade:'—',role:'Teacher',status:'Active'},
  ],
  aiSources:[
    {name:'Grade 10 ICT Textbook.pdf',pages:212,status:'Indexed'},
    {name:'Grade 11 ICT Textbook.pdf',pages:248,status:'Indexed'},
    {name:'Teacher Guide 2024.pdf',pages:96,status:'Indexed'},
    {name:'Past Paper Answers 2019-2024.pdf',pages:140,status:'Indexed'},
  ],
  blog:[
    {slug:'study-ict-grade10',title:'5 Study Habits That Boost ICT Marks in Grade 10',cat:'Study Tips',read:'4 min',grad:'linear-gradient(160deg,#b9c0f7,#8b9af0)',body:'Consistency beats cramming. Space your revision, practise past-paper MCQs weekly, and teach a concept to a friend to test true understanding. Build small programs instead of only reading code.'},
    {slug:'networking-basics',title:'Understanding the Internet: A Beginner Guide to Networking',cat:'Networking',read:'6 min',grad:'linear-gradient(160deg,#bdeede,#7dd3c0)',body:'Packets, IP addresses, routers and DNS work together every time you open a page. This post breaks down what happens between typing a URL and seeing a website.'},
    {slug:'exam-2026',title:'What to Expect in the 2026 ICT Paper',cat:'Announcements',read:'3 min',grad:'linear-gradient(160deg,#f9c6d8,#f4a6c0)',body:'A look at the structure of the upcoming examination, time management strategies, and the topics most worth revising in the final weeks.'},
  ],
  notifs:[
    {t:'Payment approved — Python Fundamentals added to your library',time:'2h ago'},
    {t:'Live class "Loops & Iteration" starts at 5:00 PM today',time:'5h ago'},
    {t:'You earned the Digital Literacy badge 🏅',time:'1d ago'},
  ],
};
