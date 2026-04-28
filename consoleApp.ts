import * as fs from "fs";
import * as readline from 'readline-sync';
import { User } from "./interfaces";

// JSON lezen
const data: User[] = JSON.parse(
    fs.readFileSync("./users.json", "utf-8")
);

function showMenu() {
    console.log("\nWelcome to the JSON data viewer!\n");
    console.log("1. View all data");
    console.log("2. Filter by ID");
    console.log("3. Exit\n");

    const choice = readline.question("Please enter your choice: ");
    handleMenu(choice);
}

function handleMenu(choice: string) {
    switch (choice) {
        case "1":
            viewAll();
            break;
        case "2":
            filterById();
            break;
        case "3":
            console.log("Goodbye!");
            process.exit();
        default:
            console.log("Invalid choice.");
            showMenu();
    }
}

// 1. Alle users + Id
function viewAll() {
    data.forEach((user) => {
        console.log(`- ${user.name} (ID: ${user.id})`);
    });
    showMenu();
}

// 2. Id
function filterById() {
    const input = readline.question("Enter user ID: ");
    const id = parseInt(input);

    const user = data.find((u) => u.id === id);

    if (!user) {
        console.log("User not found.");
        return showMenu();
    }

    console.log(`\n- ${user.name} (ID: ${user.id})`);
    console.log(`  - Description: ${user.description}`);
    console.log(`  - Daily Goal Steps: ${user.dailyGoalSteps}`);
    console.log(`  - Active: ${user.isActive}`);
    console.log(`  - Birthdate: ${user.birthDate}`);
    console.log(`  - Image: ${user.imageUrl}`);
    console.log(`  - Plan: ${user.plan}`);
    console.log(`  - Favorite Activities: ${user.favoriteActivities.join(", ")}`);

    console.log(`  - Device:`);
    console.log(`    - ID: ${user.device.id}`);
    console.log(`    - Brand: ${user.device.brand}`);
    console.log(`    - Model: ${user.device.model}`);
    console.log(`    - OS: ${user.device.os}`);
    console.log(`    - Step Sensor: ${user.device.hasStepSensor}`);
    console.log(`    - Image: ${user.device.imageUrl}`);

    showMenu();
}

showMenu();