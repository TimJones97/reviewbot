# -*- coding: utf-8 -*-
from googlemaps import GoogleMapsScraper
from datetime import datetime, timedelta
import argparse
import csv
import os, boto3

HEADER = ['id_review', 'caption', 'relative_date', 'retrieval_date', 'rating', 'username', 'n_review_user', 'n_photo_user', 'url_user']
HEADER_W_SOURCE = ['id_review', 'caption', 'relative_date','retrieval_date', 'rating', 'username', 'n_review_user', 'n_photo_user', 'url_user', 'url_source']
targetfile = open('./reviews1.csv', mode='w', encoding='utf-8', newline='\n')

def csv_writer(source_field):
    targetfile = open(source_field, mode='w', encoding='utf-8', newline='\n')
    writer = csv.writer(targetfile, quoting=csv.QUOTE_MINIMAL)

    if source_field:
        h = HEADER_W_SOURCE
    else:
        h = HEADER
    writer.writerow(h)

    return writer

def sign_s3():
    # Load necessary information into the application
    S3_BUCKET = 'jb-review-bot'

    # Load required data from the request
    file_name1 = 'reviews1.csv'
    file_name2 = 'reviews2.csv'
    file_name3 = 'reviews3.csv'

    # Initialise the S3 client
    s3 = boto3.client('s3')
    s3.upload_file(file_name1, S3_BUCKET, file_name1)
    s3.upload_file(file_name2, S3_BUCKET, file_name2)
    s3.upload_file(file_name3, S3_BUCKET, file_name3)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Google Maps reviews scraper.')
    parser.add_argument('--N', type=int, default=5, help='Number of reviews to scrape')
    parser.add_argument('--i', type=str, default='urls.txt', help='target URLs file')
    parser.add_argument('--place', dest='place', action='store_true', help='Scrape place metadata')
    parser.add_argument('--debug', dest='debug', action='store_true', help='Run scraper using browser graphical interface')
    parser.add_argument('--source', dest='source', action='store_true', help='Add source url to CSV file (for multiple urls in a single file)')
    parser.set_defaults(place=False, debug=False, source=False)

    args = parser.parse_args()

    counter = 1
    with GoogleMapsScraper(debug=args.debug) as scraper:
        with open(args.i, 'r') as urls_file:
            for url in urls_file:
            # store reviews in CSV file and increment file number with each URL
                current_file = 'reviews' + str(counter) + '.csv'
                writer = csv_writer(current_file)
                if args.place:
                    print(scraper.get_account(url))
                else:
                    error = scraper.sort_by_date(url)
                    if error == 0:

                        n = 0
                        while n < args.N:
                            reviews = scraper.get_reviews(n)

                            for r in reviews:
                                row_data = list(r.values())
                                if args.source:
                                    row_data.append(url)

                                writer.writerow(row_data)

                            n += len(reviews)
                # dirty hack to close previous reviews.csv by creating a new one
                current_file = 'reviews' + str(counter) + '.csv'
                writer = csv_writer(current_file)
                counter += 1

            #need to close file before uploading to S3
            sign_s3()

    
