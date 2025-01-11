## DB Schema

### Student data

```json
    {
        "_id":"12345678909asdfjkl",
        "name":"Student Name",
        "roll":"22501A05XX",
        "branch":"CSE | CSD | CSM | IT | ECE | EEE | CE",
        "year":"1 | 2 | 3 | 4",
        "codechef":{
            "username":"codechef_username",
            "Contests":[
                {
                    "name":"Contest Name",
                    "link":"https://www.codechef.com/START168",
                    "rank":"Rank",
                    "date":"dd-mm-yy",
                    "rating":1234,
                    "problemsSolved":2,
                    "division":"1 | 2 | 3 | 4",
                }
            ]
        },
        "leetcode":{
            "username":"leetcode_username",
            "Contests":[
                "name"
            ]
        }
    }
```

perStudent(){
    logical score=0;
    leetcode()
        .{ score(contestMul, contestPrblm , prblm*15 )
            1.data.contest into Db.Contests (lcScore+=nofContests*50)
                - maintrain Conest ref array
            2.data.performeData.map()=>{
                (lcScore+=(nofPrblms*20))
                find ref from Db.contests - add into contest ref aray
                with RollNo
                push performance to Db.Performances
            }
            3.data.userData (lcScore+=TotalPrblms*10)
                push into Students.leetcode (Update)
        }
        .score()=>{
            score+=lcScore
        };
    cf()
        .score()=>score+=score;
    cc()
        .score()=>score+=score;
    ib()
        . direct push
        .score()=>score+=score;
        
    if(pastScore<score){
        streak++;
    }
    else{
        streak=0;
    }
    pastScore=total;
    total=score;
}

Students
    {
        RollNo
        Name
        Year
        Department
        LeetCode{
            Score: 1000
            TotalProblemsSolved
            Username:
            Contests: [performanceRefs]
        }
        Codeforces{
            Score: 1000
            TotalProblemsSolved
            Username:
            Contests: [performanceRefs]
        }
        Codechef{
            Score: 1000
            TotalProblemsSolved
            Username:
            Contests: [performanceRefs]
        }
        InterviewBit{
            Score: 1000
            TotalProblemsSolved
            Username:
        }
        pastTotal:990
        Total:1000
        streak: +1 | 0
    }


Contests
    {
        _id
        platform
        contestName
        contestDate
        link -> {
            https://codeforces.com/contests/contestID,
            https://www.codechef.com/ContestCode,
            https://leetcode.com/contest/biweekly-contest-147
        }
    }

Performaces
    {
        _id
        userId
        contestRef
        Performance{
            Rating
            Delta(compute)
            ProblemsSolved
            Rank
            div?
        }
    }