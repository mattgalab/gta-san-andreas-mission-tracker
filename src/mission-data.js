module.exports = {
    areas: [
        {
            name: "Los Santos",
            categories: [
                {
                    name: "Beginning Missions",
                    missions: [
                        { id: "intro", name: "Introduction", completed: false },
                        { id: "big-smoke", name: "Big Smoke", completed: false },
                        { id: "ryder", name: "Ryder", completed: false }
                    ]
                },
                {
                    name: "Sweet Missions",
                    missions: [
                        { id: "tagging", name: "Tagging up Turf", completed: false },
                        { id: "cleaning-hood", name: "Cleaning the Hood", completed: false },
                        { id: "drive-thru", name: "Drive-thru", completed: false }
                    ]
                }
            ]
        },
        {
            name: "Countryside",
            categories: [
                {
                    name: "Countryside Missions",
                    missions: [
                        { id: "badlands", name: "Badlands", completed: false },
                        { id: "first-date", name: "First Date", completed: false },
                        { id: "king-exile", name: "King in Exile", completed: false }
                    ]
                }
            ]
        },
        {
            name: "Tags and Collectibles",
            categories: [
                {
                    name: "Tags",
                    missions: [
                        { 
                            id: "tags-los-santos", 
                            name: "Tags (Los Santos)", 
                            completed: false,
                            counter: {
                                total: 100,
                                collected: 0
                            }
                        }
                    ]
                },
                {
                    name: "Horseshoes",
                    missions: [
                        { 
                            id: "horseshoes-las-venturas", 
                            name: "Horseshoes (Las Venturas)", 
                            completed: false,
                            counter: {
                                total: 50,
                                collected: 0
                            }
                        }
                    ]
                },
                {
                    name: "Oysters",
                    missions: [
                        { 
                            id: "oysters", 
                            name: "Oysters", 
                            completed: false,
                            counter: {
                                total: 50,
                                collected: 0
                            }
                        }
                    ]
                },
                {
                    name: "Taxi Deliveries",
                    missions: [
                        { 
                            id: "taxi-deliveries", 
                            name: "Taxi Deliveries", 
                            completed: false,
                            counter: {
                                total: 50,
                                collected: 0
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
