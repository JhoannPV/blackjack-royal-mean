import { Component } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
    selector: 'app-casino',
    imports: [Navbar, Footer],
    templateUrl: './casino.html',
    styleUrl: './casino.css'
})
export class Casino { }
